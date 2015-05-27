var Util = require( 'findhit-util' ),
    Promise = require( 'bluebird' );


module.exports = function ( CoreOsManager ) {

    var defaultOptions = {
        image: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.0.0',
        size: 'Small',
        ssh: 22,
        location: 'North Europe',
        persistent: false,
        'custom-data': undefined,
    };

    CoreOsManager.prototype.nodeCreate = function ( options ) {
        var cos = this;
        var account = this.accountCurrent();
        var azure = new Azure( cos, account );

        // Handle options inherit
        options = Util.extend(
            Object.create( defaultOptions ),
            Util.is.Object( options ) && options || {}
        );

        // Initialzie node object
        var node = {};

        // TODO
        var sshCertificate = {};

        // Create a client for asmc
        var asmc = ASMC.createComputeManagementClient(
            ASMC.createCertificateCloudCredentials({
                accountId: account.id,
                pem: account.pem,
            })
        );

        // Promisify methods
        var createCloud = function ( params ) {
            return new Promise(function ( fulfill, reject ) {
                asmc.hostedServices.create( params, function ( err, res ) {
                    if ( err ) {
                        return reject( err );
                    }
                    fulfill( res );
                });
            });
        };

        var createVM = function ( serviceName, params ) {
            return new Promise(function ( fulfill, reject ) {
                asmc.virtualMachines.createOrUpdate( serviceName, params, function ( err, res ) {
                    if ( err ) {
                        return reject( err );
                    }
                    fulfill( res );
                });
            });
        };

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
                label: 'CoreOS Cloud '+ node.id,
                location: options.location,
            });
        })

        // Create VM
        .then(function () {
            return createVM();
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
