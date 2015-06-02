var Account = require( '../class' );
var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );
var debug = require( 'debug' )( 'coreos:account:provider:azure' );
var computeManagement = require( 'azure-mgmt-compute' );
var storageManagement = require( 'azure-mgmt-storage' );
var azureCommon = require( 'azure-common' );
var crypto = require( 'crypto' );
var Buffer = require( 'buffer' ).Buffer;
var fs = require( 'fs' );

var images = {
    stable: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.2.0',
    beta: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Beta-681.0.0',
    alpha: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Alpha-681.0.0',
};

function validUUID ( uuid ){
    if( ! uuid || typeof uuid != 'string' ){
        return false;
    }

    return new RegExp( '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' )
    .test( uuid );
}

var Azure = Account.extend({

    statics: {
        provider: 'Azure',
        copy: [
            'id',
            'provider',
            'subscription',
            'pem',
        ]
    },

    generateId: function () {
        if ( ! this.subscription ) {
            throw new Error( "cannot generate unique id if i don't have subscription" );
        }

        return this.subscription;
    },

    validateSubscription: function ( subscription ) {

        subscription =
            subscription ||
            this.subscription ||
            false;

        if ( ! subscription ) {
            throw new Error( "cannot find a valid subscription to validate" );
        }

        return validUUID( subscription );
    },

    validatePem: function ( pem ) {

        pem =
            pem ||
            this.pem ||
            false;

        if ( ! pem ) {
            throw new Error( "cannot find a valid pem to validate" );
        }

        // TODO regexp to validate pem
        return true;
    },

    nodeCreate: function ( node ) {
        var azure = this;

        var destroyOpts = {
            storage: false,
            cloud: false,
        };

        return Promise.cast( node )
        .tap(function () {
            debug( 'creating storage %s', node.storageName );

            return new Promise(function ( fulfill, reject ) {
                azure.storageManagementClient.storageAccounts.create(
                    {
                        name: node.storageName,
                        location: node.location,
                        label: node.storageName,
                        accountType: 'Standard_LRS',
                    },
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .tap(function () {
                destroyOpts.storage = true;
            });
        })
        .tap(function () {
            debug( 'creating cloud %s', node.cloudName );

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.hostedServices.create(
                    {
                        serviceName: node.cloudName,
                        label: node.cloudName,
                        location: node.location,
                    },
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .tap(function () {
                destroyOpts.cloud = true;
            });
        })
        .tap(function () {
            debug( 'uploading certificate' );

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.serviceCertificates.create(
                    node.cloudName,
                    {
                        data: new Buffer(node.identity.certificate).toString( 'base64' ),
                        certificateFormat: 'pfx'
                    },
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            });
        })
        .tap(function () {
            debug( 'creating vm %s', node.vmName );

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.virtualMachines.createDeployment(
                    node.cloudName,
                    {
                        name: node.vmName,
                        label: node.vmName,

                        deploymentSlot: "Production",
                        roles: [
                            {
                                roleType: "PersistentVMRole",
                                roleName: node.vmName,
                                roleSize: node.size,

                                label: node.vmName,

                                oSVirtualHardDisk: {
                                    sourceImageName: node.imagePath,
                                    mediaLink: "http://"+ node.storageName + ".blob.core.windows.net/coreos/" + node.id + ".vhd"
                                },
                                dataVirtualHardDisks: [],
                                configurationSets: [
                                    {
                                        configurationSetType: "LinuxProvisioningConfiguration",
                                        customData: new Buffer( node.cloudConfig ).toString( 'base64' ),
                                        userName: node.userName,
                                        userPassword: node.userPassword || undefined,
                                        disableSshPasswordAuthentication: ( ! node.userPassword ) + '',
                                        hostName: node.vmName,
                                        provisionGuestAgent: true,
                                        enableAutomaticUpdates: true,
                                        resetPasswordOnFirstLogon: false,
                                        sshSettings: {
                                            publicKeys: [
                                                {
                                                    fingerprint: node.identity.fingerprint.replace( /:/g ,''),
                                                    path: '/home/' + node.userName + '/.ssh/authorized_keys',
                                                },
                                            ],
                                        },
                                        //storedCertificateSettings: [],
                                        //inputEndpoints: [],
                                    },
                                    {
                                        configurationSetType: "NetworkConfiguration",
                                        subnetNames: [],
                                        storedCertificateSettings: [],
                                        inputEndpoints: node.ports.map(function ( expose ) {
                                            return {
                                                name: expose.protocol + '_' + expose.port,
                                                port: expose.port,
                                                localPort: expose.port,
                                                protocol: expose.protocol,
                                            };
                                        })
                                    }
                                ]
                            }
                        ]
                    },
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            });
        })

        // In case of error, rollback
        .catch(function ( err ) {
            return azure.nodeDestroy( node, destroyOpts )
            .then(function () {
                throw err;
            });
        });
    },

    nodeDestroy: (function ( defaultOptions ) {
        return function ( node, options ) {
            var azure = this;

            options = Util.extend( {}, defaultOptions, Util.is.Object( options ) ? options : {} );

            return Promise.cast( node )
            .tap(function () {
                if ( ! options.cloud ) {
                    return;
                }

                debug( 'deleting cloud' );

                return new Promise(function ( fulfill, reject ) {
                    azure.computeManagementClient.hostedServices.deleteAll(
                        node.cloudName,
                        function ( err, res ) {
                            if ( err ) return reject( err );
                            fulfill( res );
                        }
                    );
                });
            })
            .tap(function () {
                return options.delay ? Promise.delay( options.delay ) : null;
            })
            .delay( 60000 )
            .tap(function () {
                if ( ! options.storage ) {
                    return;
                }

                debug( 'deleting storage' );

                return new Promise(function ( fulfill, reject ) {
                    azure.storageManagementClient.storageAccounts.deleteMethod(
                        node.storageName,
                        function ( err, res ) {
                            if ( err ) return reject( err );
                            fulfill( res );
                        }
                    );
                });
            });
        };
    })({
        cloud: true,
        storage: true,
        delay: 60000,
    }),

    prepareNode: function ( node ) {

        var id = node.id.split( '-' )[ 0 ];

        node.vmName = 'cos-vm-' + id;
        node.cloudName = 'cos-cloud-' + id;
        node.storageName = 'cosstrg' + id;

        node.host = node.cloudName + '.cloudapp.net';

        node.imagePath = images[ node.image ];
        if ( ! node.imagePath ) {
            throw new Error( "invalid node.image provided" );
        }

        return node;
    },

    cleanNode: function ( node ) {

        delete node.imagePath;

        return node;
    },

    // TODO
    // add methods for managing endpoints / firewall ports management

});

// Handle subscription verification
Azure.addInitHook(function () {
    this.validateSubscription();
});

// Handle pem
Azure.addInitHook(function () {
    if ( this.pemPath ) {
        this.pem = fs.readFileSync( this.pemPath ).toString();
        delete this.pemPath;
    }
});

// Handle defaults
Azure.addInitHook(function () {
    if ( ! this.image ) {
        this.image = 'stable';
    }
});

// Handle azure management clients
Azure.addInitHook(function () {

    // Generate credentials
    var credentials = this.credentials = new azureCommon.CertificateCloudCredentials({
        subscriptionId: this.subscription,
        pem: this.pem,
    });

    this.computeManagementClient = computeManagement.createComputeManagementClient( credentials );
    this.storageManagementClient = storageManagement.createStorageManagementClient( credentials );

});

// Export Azure
module.exports = Azure;
