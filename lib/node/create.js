var Util = require( 'findhit-util' );
var Account = require( '../account/class' );
var Promise = require( 'bluebird' );
var Pem = require( 'pem' );
var YAML = require( 'yamljs' );
var debug = require( 'debug' )( 'coreos:node:create' );

var createCertificate = Promise.promisify( Pem.createCertificate );
var getFingerprint = Promise.promisify( Pem.getFingerprint );

var groups = [
    'alpha',
    'beta',
    'stable'
];

function generateFleetMetadata ( cos, node ) {
    // Generating metadata with format scpecified at:
    // https://github.com/coreos/fleet/blob/master/Documentation/deployment-and-configuration.md#metadata

    var account = cos.accountGet( node.account );

    var metadata = {
        'id': node.id,
        'region': node.location,
        'location': node.location,
        'account-id': account.id,
        'account-provider': account.provider
    };

    // In case node object has metadata object, merge it into previously
    // created metadata object
    if ( Util.is.Object( node.metadata ) ) {
        Util.extend( metadata, node.metadata );
    }

    metadata = Util.Array.map( Object.keys( metadata ), function ( key ) {
        return key + '=' + metadata[ key ];
    }).join( ',' );

    return metadata;
}

function generateCloudConfig ( cos, node ) {
    var cloudConfig;

    cloudConfig = {
        "hostname": node.host,
        "coreos": {
            "etcd2": {
                "name": node.id,
                "advertise-client-urls": 'http://' + node.host + ':2379',
                "initial-advertise-peer-urls": 'http://' + node.host + ':2380',

                "listen-client-urls": "http://0.0.0.0:2379,http://0.0.0.0:4001",
                "listen-peer-urls": "http://0.0.0.0:2380,http://0.0.0.0:7001",

                // Best params for working on clouds
                "peer-election-timeout": 500,
                "peer-heartbeat-interval": 100
            },
            "fleet": {
                "public-ip": "$public_ipv4",
                "metadata": generateFleetMetadata( cos, node ),
            },
            "flannel": {
                "interface": "eth0",
            },
            "update":{
                "group": node.group,
                "reboot-strategy": "best-effort",
            },
            "units": [
                {
                    "name": "etcd2.service",
                    "command": "start",
                },
                {
                    "name": "fleet.service",
                    "command": "start",
                },
                {
                    "name": "flanneld.service",
                    "command": "start",
                    "drop-ins": [
                        {
                            "name": "50-network-config.conf",
                            "content": [
                                "[Service]",
                                "ExecStartPre=/usr/bin/etcdctl set /coreos.com/network/config '{ \"Network\": \"10.1.0.0/16\" }'"
                            ].join( "\n" ),
                        }
                    ]
                }
            ]
        },
        "write_files": [
            {
                "path": "/etc/hosts",
                "permissions": 644,
                "owner": "root",
                "content": [

                    "127.0.0.1 localhost",
                    "127.0.0.1 " + node.id,
                    "127.0.0.1 " + node.host,

                ].join( "\n" ),
            },
        ]
    };

    // Add current hosts list to etcd
    var nodes = cos.configGet( 'nodes', {} );
    var nodesIds = Object.keys( nodes );

    cloudConfig.coreos.etcd2[ 'initial-cluster-state' ] = 'new';
    cloudConfig.coreos.etcd2[ 'initial-cluster' ] = node.id + '=http://'+ node.host +':2380';

    if( nodesIds.length > 0 ) {
        cloudConfig.coreos.etcd2[ 'initial-cluster-state' ] = 'existing';
        cloudConfig.coreos.etcd2[ 'initial-cluster' ] += ',' + nodesIds
            .map(function ( id ) {
                return id + '=' + 'http://' + nodes[id].host + ':2380';
            })
            .join( ',' );
    }

    // Parse to YAML
    cloudConfig = YAML.stringify( cloudConfig, Infinity, 4 );

    // Add cloudConfig comment
    cloudConfig = "#cloud-config" + "\n" + cloudConfig;

    debug( 'cloud-config generated' );
    debug( cloudConfig );

    return cloudConfig;
}

module.exports = function ( CoreOS ) {

    var defaultOptions = {
        group: 'stable',
        size: 'Small',
        sshPort: 22,
        userName: 'core',
        userPassword: false,
        location: 'North Europe',
        persistent: false,
        simulate: false,
        node: false,
        waitUntilItsAlive: 120000, // 120s to get it up, seems enough
    };

    CoreOS.prototype.nodeCreate = function ( options ) {
        var cos = this;
        var node = {};
        var nodes = cos.configGet( 'nodes', {} );

        return Promise.try(function () {

            // Handle options inherit
            options = Util.extend(
                {}, defaultOptions,
                Util.is.Object( options ) && options || {}
            );

            var account =
                options.account && (
                    typeof options.account === 'string' &&
                        cos.accountGet( options.account ) ||
                    options.account instanceof Account &&
                        options.account
                ) ||
                cos.accountCurrent() ||
                false;

            if ( ! account ) {
                throw new TypeError( "cannot get account we should use" );
            }

            // Generate id for node
            var id = Util.uuid();

            // Initialzie node object
            node.id = id;
            node.account = account.id;
            node.host = undefined; // should be handled by account
            node.ports = [];

            node.userName =
                options.userName !== undefined && options.userName ||
                defaultOptions.userName;

            node.userPassword =
                options.userPassword !== undefined && options.userPassword ||
                defaultOptions.userPassword;

            node.location =
                options.location !== undefined && options.location ||
                defaultOptions.location;

            node.persistent =
                options.persistent !== undefined && options.persistent ||
                defaultOptions.persistent;

            node.sshPort =
                options.sshPort !== undefined && options.sshPort ||
                defaultOptions.sshPort;



            if ( options.group ) node.group = options.group;

            if ( groups.indexOf( node.group ) === -1 ) {
                throw new TypeError( "invalid group provided" );
            }

            // Handle ports
            node.ports.push(
                // ssh
                { port: options.sshPort, protocol: 'tcp' },
                // etcd
                { port: 2379, protocol: 'tcp' },
                { port: 2380, protocol: 'tcp' },
                // flanneld
                { port: 8285, protocol: 'udp' }
            );

            // Check if there is an object called node into options so we can
            // override node object properties
            if ( Util.is.Object( options.node ) ) {
                Util.extend( node, options.node );
            }

            if ( Util.is.Function( account.prepareNode ) ) {
                account.prepareNode( node );
            }

            // Generate node's cloudconfig
            node.cloudConfig = generateCloudConfig( cos, node );

            return options.simulate ?
                node :
                Promise.cast( node )
                .tap(function () {
                    debug( 'creating identity' );
                    return cos.nodeCreateSshIdentity( node );
                })
                .tap(function () {
                    debug( 'creating node' );
                    return account.nodeCreate( node );
                })

                // Add it to current cluster
                .then(function () {

                    if( Object.keys( nodes ).length === 0 ) {
                        return;
                    }

                    // Add it using etcdctl
                    return cos.etcdctl([
                        'member', 'add',
                        node.id, 'http://' + node.host + ':2380'
                    ]);
                })

                .then(function () {

                    nodes[ id ] = node;

                    // But lets clean things we don't need in the future
                    delete node.cloudConfig;

                    if ( Util.is.Function( account.cleanNode ) ) {
                        account.cleanNode( node );
                    }
                })

                .then(function () {

                    if ( ! options.waitUntilItsAlive ) {
                        return;
                    }

                    debug( 'waiting for node to become alive' );
                    return cos.nodeCheckIfItsAlive( node, options.waitUntilItsAlive );
                });
        })
        .return( node );
    };

    CoreOS.prototype.nodeCheckIfItsAlive = function ( node, timeout ) {
        var cos = this;
        var started = + new Date();
        timeout = +timeout || 120000;

        debug( 'checking if node %s is alive with a timout of %s ms', node.id, timeout );

        function connect_to_node (  ) {
            debug( 'trying to connect to %s', node.id );

            return cos.nodeSSHReady( node )
            .then(function ( ssh ) {
                ssh.end();
            }, function () {

                if ( (new Date() - timeout ) > started ) {
                    debug( "timedout, will not retry anymore" );
                    return;
                }

                // reconnect
                return connect_to_node();
            });
        }

        return connect_to_node()
            .tap(function () {
                debug( 'check was successful' );
            }, function () {
                debug( 'check failed' );
            });
    };

    CoreOS.prototype.nodeCreateSshIdentity = function ( node ) {
        debug( 'nodeCreateSshIdentity' );

        return createCertificate({
            keyBitsize: 2048,
            selfSigned: true,
            days: 730,
        })
        .tap(function ( identity ) {
            node.identity = identity;
        })
        .tap(function ( identify ) {
            debug( 'generating fingerprint' );

            return getFingerprint( identify.certificate )
            .then(function ( data ) {
                identify.fingerprint = data && data.fingerprint || undefined;
            });
        });
    };

};
