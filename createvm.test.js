var Promise = require( 'bluebird' );
var fs = require( 'fs' );
var Util = require( 'findhit-util' );
var debug = require( 'debug' )( 'testing' );
var computeManagement = require( 'azure-mgmt-compute' );
var storageManagement = require( 'azure-mgmt-storage' );


debug( 'creating credentials' );

var credentials = computeManagement.createCertificateCloudCredentials({
    accountId: '1cce3c52-effb-44bf-9b52-276c7b39ea1c',
    pem: fs.readFileSync( __dirname + '/test/resources/1cce3c52-effb-44bf-9b52-276c7b39ea1c.pem', 'utf-8' )
});

debug( 'creating computeManagement client' );
var computeManagementClient = computeManagement.createComputeManagementClient( credentials );

debug( 'creating storageManagement client' );
var storageManagementClient = storageManagement.createStorageManagementClient( credentials );

debug( 'creating node object' );
var node = {};

Promise.try(function () {

    node.id = Util.uniqId();
    node.vmName = 'cos-vm-' + node.id;
    node.cloudName = 'cos-cloud-' + node.id;
    node.storageName = 'cosstrg' + node.id;
    node.location = "North Europe";
    node.size = "Small";
    node.image = '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.0.0';
    node.user = 'core';
    node.password = 'TestingThis123';

})

.then(function () {
    debug( 'creating storage' );

    return new Promise(function ( fulfill, reject ) {
        storageManagementClient.storageAccounts.create(
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

.then(function () {
    debug( 'creating cloud' );

    return new Promise(function ( fulfill, reject ) {
        computeManagementClient.hostedServices.create(
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
        computeManagementClient.virtualMachines.createDeployment(
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
                            sourceImageName: node.image,
                            mediaLink: "http://"+ node.storageName + ".blob.core.windows.net/coreos/" + node.id + ".vhd"
                        },
                        dataVirtualHardDisks: [],
                        configurationSets: [
                            {
                                configurationSetType: "LinuxProvisioningConfiguration",
                                userName: node.user,
                                userPassword: node.password || undefined,
                                disableSshPasswordAuthentication: ! node.password,
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
                                        localPort: 22,
                                        protocol: "tcp",
                                        name: "tcp_22"
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

.then(function () {
    debug( 'all things went ok!!' );
}, function ( err ) {
    debug( 'something happened' );
    debug( err );
});
