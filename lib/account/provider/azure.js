var Account = require( '../class' );
var Promise = require( 'bluebird' );
var debug = require( 'debug' )( 'coreos:account:type:azure' );
var computeManagement = require( 'azure-mgmt-compute' );
var storageManagement = require( 'azure-mgmt-storage' );
var azureCommon = require( 'azure-common' );
var crypto = require( 'crypto' );
var Buffer = require( 'buffer' ).Buffer;

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
            'provider',
            'subscription',
            'pem',
        ]
    },

    uniqId: function () {
        if ( ! this.subscription ) {
            throw new Error( "cannot generate unique id if i don't have subscription" );
        }

        return crypto
        .createHash( 'md5' )
        .update( this.subscription )
        .digest( 'hex' )
        .substr( 0, 6 );
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

        return this.prepareNode( node )
        .then(function () {
            debug( 'creating storage' );

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
            });
        })
        .then(function () {
            debug( 'creating cloud' );

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
            });
        })
        .then(function () {
            debug( 'creating vm' );

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
                                        disableSshPasswordAuthentication: ! node.userPassword,
                                        hostName: node.vmName,
                                        provisionGuestAgent: true,
                                        enableAutomaticUpdates: true,
                                        resetPasswordOnFirstLogon: false,
                                        storedCertificateSettings: [],
                                        inputEndpoints: [],
                                    },
                                    {
                                        configurationSetType: "NetworkConfiguration",
                                        subnetNames: [],
                                        storedCertificateSettings: [],
                                        inputEndpoints: [
                                            {
                                                port: node.sshPort,
                                                localPort: 22,
                                                protocol: "tcp",
                                                name: "tcp_22"
                                            },
                                            {
                                                port: 4001,
                                                localPort: 4001,
                                                protocol: "tcp",
                                                name: "tcp_4001"
                                            },
                                            {
                                                port: 7001,
                                                localPort: 7001,
                                                protocol: "tcp",
                                                name: "tcp_7001"
                                            }
                                        ]
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
            return azure.nodeDestroy( node )
            .then(function () {
                throw err;
            });
        });
    },

    nodeDestroy: function ( node ) {
        var azure = this;

        return this.prepareNode( node )
        .then(function () {
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
        .then(function () {
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
    },

    prepareNode: function ( node ) {
        return Promise.try(function () {

            node.vmName = 'cos-vm-' + node.id;
            node.cloudName = 'cos-cloud-' + node.id;
            node.storageName = 'cosstrg' + node.id;

            node.host = node.cloudName + '.cloudapp.net';

            node.imagePath = images[ node.image ];
            if ( ! node.imagePath ) {
                throw new Error( "invalid node.image provided" );
            }

            return node;
        });
    }

    // TODO
    // add methods for managing endpoints / firewall ports management

});

// Handle subscription verification
Azure.addInitHook(function () {
    this.validateSubscription();
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
