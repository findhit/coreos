var Util = require( 'findhit-util' ),
    Account = require( '../account/class' ),
    Promise = require( 'bluebird' );

function generateFleetMetadata ( cos, node ) {
    // Generating metadata with format scpecified at:
    // https://github.com/coreos/fleet/blob/master/Documentation/deployment-and-configuration.md#metadata

    var metadata = {
        region: node.location,
        location: node.location,
        id: node.id,
    };

    // In case node object has metadata object, merge it into previously
    // created metadata object
    if ( Util.is.Object( node.metadata ) ) {
        Util.extend( metadata, node.metadata );
    }

    return Util.Array.map( Object.keys( metadata ), function ( key ) {
        return key + '=' + metadata[ key ];
    }).join( ',' );
}

function generateCloudConfig ( cos, node ) {
    return "#cloud-config" + "\n\n" + YAML.stringify({
        coreos: {
            etcd: {
                discovery: cos.discovery(),
                addr: '$private_ipv4:4001',
                'peer-addr': '$public_ipv4:7001'
            },
            fleet: {
                'public-ip': '$public_ipv4',
                metadata: generateFleetMetadata( cos, node ),
            },
            units: [
                {
                    name: 'etcd.service',
                    command: 'start',
                },
                {
                    name: 'fleet.service',
                    command: 'start',
                },
                {
                    name: 'flanneld.service',
                    command: 'start',
                }
            ],
        },
    });
}

module.exports = function ( CoreOS ) {

    var defaultOptions = {
        image: 'stable',
        size: 'Small',
        sshPort: 22,
        userName: 'core',
        userPassword: false,
        location: 'North Europe',
        persistent: false,
        simulate: false,
        node: false,
    };

    CoreOS.prototype.nodeCreate = function ( options ) {
        var cos = this;
        var node = {};

        return Promise.try(function () {


            // Handle options inherit
            options = Util.extend(
                Object.create( defaultOptions ),
                Util.is.Object( options ) && options || {}
            );

            var account =
                options.account && (
                    typeof options.account === 'string' &&
                        cos.accountGet( options.account ) ||
                    Util.is.instanceof( Account, options.account ) &&
                        options.account
                ) ||
                cos.accountCurrent() ||
                false;

            if ( ! account ) {
                throw new TypeError( "cannot get account we should use" );
            }

            // Generate id for node
            var id = Util.uniqId();

            // Initialzie node object
            node.id = id;
            node.account = account.id;
            node.userName = options.userName;
            node.userPassword = options.userPassword;
            node.location = options.location;
            node.persistent = options.persistent;
            node.sshPort = options.sshPort;

            // Check if there is an object called node into options so we can
            // override node object properties
            if ( Util.is.Object( node ) ) {
                Util.extend( node, options.node );
            }

            // Generate node's cloudconfig
            node.cloudConfig = generateCloudConfig( cos, node );

            return options.simulate ?
                node :
                account.nodeCreate( node )
                .then(function () {
                    var nodes = cos.configGet( 'nodes', {} );

                    nodes[ id ] = node;
                });
        });
    };

};
