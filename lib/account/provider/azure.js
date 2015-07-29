var Account = require( '../class' );
var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );
var debug = require( 'debug' )( 'coreos:account:provider:azure' );
var computeManagement = require( 'azure-mgmt-compute' );
var storageManagement = require( 'azure-mgmt-storage' );
var azureCommon = require( 'azure-common' );
var Buffer = require( 'buffer' ).Buffer;
var fs = require( 'fs' );


var images = {
    stable: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-681.0.0',
    beta: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Beta-695.0.0',
    alpha: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Alpha-709.0.0',
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

    generateLinuxProvisioningConfiguration: function ( node ) {
        return {
            configurationSetType: "LinuxProvisioningConfiguration",
            customData: new Buffer( node.cloudConfig.toYAML() ).toString( 'base64' ),
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
        };
    },

    nodeCreate: function ( node ) {
        var azure = this;

        return Promise.cast( node )
        .tap(function () {
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
            });
        })
        .tap(function () {
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
                                    azure.generateLinuxProvisioningConfiguration( node ),
                                    {
                                        configurationSetType: "NetworkConfiguration",
                                        subnetNames: [],
                                        storedCertificateSettings: [],
                                        inputEndpoints: []
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

        return Promise.cast( node )
        .tap(function () {
            debug( 'determining if cloud exists' );

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.hostedServices.get(
                    node.cloudName,
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .then(
                function () {
                    debug( 'deleting cloud' );

                    return new Promise(function ( fulfill, reject ) {
                        azure.computeManagementClient.hostedServices.deleteAll(
                            node.cloudName,
                            function ( err, res ) {
                                if ( err ) return reject( err );
                                fulfill( res );
                            }
                        );
                    })
                    // Adding a delay since cloud takes time to delete
                    // vm's disks
                    .delay( 180000 );
                },
                function () {
                    debug( 'cloud does not exist, ignoring' );
                }
            );
        })
        .tap(function () {
            debug( 'determining if storage exists' );

            return new Promise(function ( fulfill, reject ) {
                azure.storageManagementClient.storageAccounts.get(
                    node.storageName,
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .then(
                function () {
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
                },
                function () {
                    debug( 'storage does not exist, ignoring' );
                }
            );
        });
    },

    nodeInitialize: function ( node ) {

        var id = node.id.split( '-' )[ 0 ];

        node.vmName = 'cos-vm-' + id;
        node.cloudName = 'cos-cloud-' + id;
        node.storageName = 'cosstrg' + id;

        node.host = node.cloudName + '.cloudapp.net';

        node.imagePath = images[ node.group ];
        if ( ! node.imagePath ) {
            throw new Error( "invalid node.image provided" );
        }

        return node;
    },

    nodeClean: function ( node ) {

        delete node.imagePath;

        return node;
    },

    nodeGet: function ( node ) {
        var azure = this;

        debug( 'getting node %s data', node.id );

        return new Promise(function ( fulfill, reject ) {
            azure.computeManagementClient.virtualMachines.get(
                node.cloudName,
                node.vmName,
                node.vmName,
                function ( err, res ) {
                    if ( err ) return reject( err );
                    fulfill( res );
                }
            );
        });
    },

    nodeGetEndpoints: function ( node ) {

    },

    nodeSyncFirewallRules: function ( node ) {
        var azure = this;

        return azure.nodeGet( node )
        .then(function ( azureNode ) {
            var firewallRules = node && node.firewallRules || [];
            var endpoints = {};
            var networkConfiguration = azureNode.configurationSets
                .filter(function ( cs ) {
                    return cs.configurationSetType === 'NetworkConfiguration';
                })[ 0 ];

            debug( 'updating endpoints for node %s', node.id );
            console.table( firewallRules );

            firewallRules
            .forEach(function ( fr ) {
                var name = fr.protocol + '_' + fr.port;
                var endpoint = endpoints[ name ] =
                    endpoints[ name ] ||
                    {
                        name: name,
                        port: fr.port,
                        localPort: fr.port,
                        protocol: fr.protocol,
                        enableDirectServerReturn: false,
                        endpointAcl: {
                            rules: [],
                        },
                    };

                // Add rule and cidr
                endpoint.endpointAcl.rules.push({
                    remoteSubnet: fr.cidr,
                    action: fr.action === 'DENY' && 'deny' || 'permit',
                    description: fr.id
                });
            });

            // Fill up endpointAcl.order
            Util.Object.each( endpoints, function ( endpoint ) {
                // For each endpointAcl set the order element
                endpoint.endpointAcl.rules.forEach(function ( rule, i ) {
                    rule.order = i;
                });
            });

            // Convert endpoints to an usable format
            // Dont try to understand please... :/
            networkConfiguration.inputEndpoints = Object.keys( endpoints )
                .map(function ( name ) {
                    return endpoints[ name ];
                });

            debug( 'saving new endpoints for node %s', node.id );

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.virtualMachines.update(
                    node.cloudName,
                    node.vmName,
                    node.vmName,
                    azureNode,
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .then(function () {
                debug( 'endpoints for node %s updated', node.id );
            });
        });

    },

    nodeSyncCloudConfig: function ( node ) {
        var azure = this;

        return azure.nodeGet( node )
        .then(function ( azureNode ) {
            var linuxProvisioningConfiguration = azureNode.configurationSets
                .filter(function ( cs ) {
                    return cs.configurationSetType === 'LinuxProvisioningConfiguration';
                })[ 0 ] ||
                undefined;

            if ( ! linuxProvisioningConfiguration ) {
                linuxProvisioningConfiguration = azure.generateLinuxProvisioningConfiguration( node );
                azureNode.configurationSets.push( linuxProvisioningConfiguration );
            } else {
                linuxProvisioningConfiguration.customData =
                    new Buffer( node.cloudConfig.toYAML() ).toString( 'base64' );
            }

            return new Promise(function ( fulfill, reject ) {
                azure.computeManagementClient.virtualMachines.update(
                    node.cloudName,
                    node.vmName,
                    node.vmName,
                    azureNode,
                    function ( err, res ) {
                        if ( err ) return reject( err );
                        fulfill( res );
                    }
                );
            })
            .then(function () {
                debug( 'cloudConfig for node %s updated', node.id );
            });
        });

    },

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
