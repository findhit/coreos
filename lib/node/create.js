var Util = require( 'findhit-util' ),
    ASMC = require( 'azure-asm-compute' ),
    Promise = require( 'bluebird' );

module.exports = function ( CoreOsAzure ) {

    var defaultOptions = {
        image: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.0.0',
        size: 'Small',
        ssh: 22,
        location: 'North Europe',
        'custom-data': undefined,
    };

    CoreOsAzure.prototype.nodeCreate = function ( options ) {

        // Handle options inherit
        Util.extend(
            Object.create( defaultOptions ),
            Util.is.Object( options ) && options || {}
        );

        var subscription = this.subscriptionGetCurrent();
        var nodes = this.configGet('nodes', {});

        // Initialzie node object
        var node = {};

        // TODO
        var sshCertificate = {};

        // Create a client for asmc
        var asmc = ASMC.createComputeManagementClient(
            ASMC.createCertificateCloudCredentials({
                subscriptionId: subscription.id,
                pem: subscription.pem,
            })
        );

        // Promisify methods
        var createCloud = Promise.promisify( asmc.hostedServices.create );
        var createVM = Promise.promisify( asmc.virtualMachines.createDeployment );

        return Promise.try(function () {

            // Generate id for node
            var id = node.id = Util.uniqId();

            // Generate machine and cloud name
            node.cloudName = 'coreos-cloud-' + id;
            node.deploymentName = 'coreos-dp-' + id;
            node.vmName = 'coreos-vm-' + id;

        })

        // Create cloud
        .then(function () {
            return createCloud({
                serviceName: node.cloudName,
                label: 'CoreOS Cloud '+ id,
                location: options.locaton,
            });
        })

        // Create VM
        .then(function () {
            return createVM( node.cloudName, {
                name: node.deploymentName,
                deploymentSlot: "Production",
                label: 'CoreOS Deployment '+ id,

                roles:[
                    {
                        roleName: node.vmName,
                        roleSize: node.size,
                        label: 'CoreOS VM '+ id,

                        oSVirtualHardDisk: {
                            sourceImageName: options.image,
                        },

                        configurationSets: [
                            {
                                configurationSetType: "NetworkConfiguration",
                                subnetNames: [],
                                storedCertificateSettings: [],
                                inputEndpoints: [
                                    {
                                        localPort: 22,
                                        protocol: "tcp",
                                        name: "tcp_22"
                                    },
                                    {
                                        localPort: 4001,
                                        protocol: "tcp",
                                        name: "tcp_4001"
                                    },
                                    {
                                        localPort: 7001,
                                        protocol: "tcp",
                                        name: "tcp_7001"
                                    }
                                ],
                            },
                            {
                                configurationSetType: "ProvisioningConfiguration",
                                userName: 'core',
                                disableSshPasswordAuthentication: true,
                                sshSettings: {
                                    keyPairs: [],
                                    publicKeys: [],
                                },
                                customData: undefined,
                            }
                        ],
                    },
                ],
            });
        })

        // end node object preparation
        .then(function () {

            // Merge given options with node data
            node.size = options.size;
            node.image = options.image;
            node.sshPort = options.ssh;
            node.sshCertificate = sshCertificate.id;

            // save node
            nodes[ node.id ] = node;

        });
    };

};
