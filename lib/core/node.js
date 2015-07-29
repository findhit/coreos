var debug = require( 'debug' )( 'coreos:core:node' );
var Class = require( 'findhit-class' );
var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );
var CloudConfig = require( './cloud-config' );
var Account = require( '../account/class' );
var CoreOS = require( '../' );
var Pem = require( 'pem' );
var createCertificate = Promise.promisify( Pem.createCertificate );
var getFingerprint = Promise.promisify( Pem.getFingerprint );
var dns = require( 'dns-sync' );

CoreOS.addInitHook(function () {
    var cos = this;

    if ( Util.is.Object( cos.config.nodes ) ) {
        cos.config.nodes = Util.Object.map( cos.config.nodes, function ( data ) {
            return new Node( data, cos );
        });
    }

});

function generateFleetMetadata ( cos, node ) {
    // Generating metadata with format scpecified at:
    // https://github.com/coreos/fleet/blob/master/Documentation/deployment-and-configuration.md#metadata

    var account = cos.accountGet( node.account );

    var metadata = {
        'id': node.id,
        'role': node.role,
        'location': node.location,
        'persistent': node.persistent ? "true" : "false",
        'size': node.size,
        'account-id': account.id,
        'account-provider': account.provider,
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

var Node = Class.extend({

    statics: {

        Roles: [
            'boss',
            'worker',
        ],

        Groups: [
            'stable',
            'beta',
            'alpha',
        ],

    },

    initialize: function ( data, cos ) {
        if ( Util.is.instanceof( Node, data ) ) {
            return data;
        }

        if( Util.isnt.instanceof( CoreOS, cos ) ) {
            throw new TypeError( "invalid cos provided" );
        }

        var node = this;
        node.cos = cos;

        if ( Util.is.Object( data ) ) {
            for( var i in data ) {
                if( data.hasOwnProperty( i ) && typeof data[ i ] !== 'undefined' ) {
                    node[ i ] = data[ i ];
                }
            }
        }

        // Backwards compability
        if ( this.ports ) {
            this.firewallRules = this.ports;
            delete this.ports;
        }

        if ( ! node.id ) {
            node.id = Util.uuid();
        }
        node.account =
            typeof node.account === 'object' && node.account instanceof Account && node.account ||
            typeof node.account !== 'undefined' && cos.accountGet( node.account ) ||
            cos.accountCurrent() ||
            cos.accountGet( 'random' );

        if ( ! node.account ) {
            throw new TypeError( "cannot get account we should use" );
        }

        node.cloudConfig =
            Util.is.instanceof( CloudConfig, node.cloudConfig ) && node.cloudConfig ||
            Util.extend( new CloudConfig(), Util.is.Object( node.cloudConfig ) && node.cloudConfig || {} );

        node.role =
            typeof node.role === 'number' && Node.Roles[ node.role ] ||
            typeof node.role === 'string' && Node.Roles.indexOf( node.role ) !== -1 && node.role ||
            Node.Roles[ 0 ];

        node.group =
            typeof node.group === 'number' && Node.Groups[ node.group ] ||
            typeof node.group === 'string' && Node.Groups.indexOf( node.group ) !== -1 && node.group ||
            Node.Groups[ 0 ];

        if ( node.role === 'boss' && ! node.persistent ) {
            throw new Error( "boss nodes should be always persistent" );
        }

        if ( node.account.nodeInitialize ) {
            node.account.nodeInitialize( node );
        }

        if ( ! node.ip && node.host ) {
            debug( 'ensuring that we have an ip!!' );
            node.getIpFromHost();
        }

        return this;
    },

    getIpFromHost: function () {
        this.ip = dns.resolve( this.host );
        return this.ip;
    },

    syncFirewallRules: function () {
        return this.account.nodeSyncFirewallRules( this );
    },

    syncCloudConfig: function () {
        return this.account.nodeSyncCloudConfig( this );
    },

    generateCloudConfig: function ( useOlder ) {
        var node = this;
        var cos = this.cos;

        var cloudConfig = ( useOlder ? node.cloudConfig : new CloudConfig() )
            .set( 'hostname', node.host )
            .configure( 'update', {
                "group": node.group,
                "reboot-strategy": "best-effort",
            })
            .writeFile({
                "path": "/etc/hosts",
                "permissions": 644,
                "owner": "root",
                "content": [

                    "127.0.0.1 localhost",
                    "127.0.0.1 " + node.id,
                    "127.0.0.1 " + node.host,

                ].join( "\n" ),
            });

        // Ensure we have public ip
        cloudConfig.addUnit({
            "name": "has-public-ip.service",
            "command": "start",
            "content": [
                "[Unit]",
                "Description=Sets as started after it founds a public ip on /etc/environment",
                "After=coreos-setup-environment.service",
                "",
                "[Service]",
                "Type=oneshot",
                "TimeoutSec=10min",
                "FailureAction=reboot-force",
                "RemainAfterExit=yes",
                "Environment=INTERVAL=1",
                "Environment=FILE=/etc/environment",

                // Wait for IPV4, nasty, i know...
                "ExecStartPre=/bin/bash -c 'while [ \"$COREOS_PUBLIC_IPV4\" == \"\" ]; do sleep $INTERVAL; source $FILE; done;'",
                "ExecStart=/bin/bash -c 'source $FILE; echo \"We have now a public IP: $COREOS_PUBLIC_IPV4\";'"

            ].join( "\n" ),
        });

        // Configure etcd2
        cloudConfig.addUnit({
            "name": "etcd2.service",
            "command": "start",
        });

        cloudConfig.configure( 'etcd2', {
            "name": node.id,
            "discovery": cos.config.discovery,
            "advertise-client-urls": 'http://' + node.host + ':2379',
            "initial-advertise-peer-urls": 'http://' + node.host + ':2380',

            "listen-client-urls": "http://0.0.0.0:2379,http://0.0.0.0:4001",
            "listen-peer-urls": "http://0.0.0.0:2380,http://0.0.0.0:7001",

            // Best params for working on clouds
            "peer-election-timeout": 500,
            "peer-heartbeat-interval": 100,
        });

        // Configure fleet
        cloudConfig.configure( 'fleet', {
            "public-ip": "$public_ipv4",
            "metadata": generateFleetMetadata( cos, node ),
        });

        cloudConfig.addUnit({
            "name": "fleet.service",
            "command": "start",
        });

        // Configure flannel network
        cloudConfig.configure( 'flannel', {
            "interface": "eth0",
            // "public_ip": "$public_ipv4",
        });

        cloudConfig.addUnit({
            "name": "flanneld.service",
            "command": "start",
            "drop-ins": [
                {
                    "name": "60-public-ip.conf",
                    "content": [
                        "[Unit]",
                        "Requires=has-public-ip.service",
                        "After=has-public-ip.service",
                        "",
                        "[Service]",
                        "ExecStartPre=/bin/bash -c 'touch /run/flannel/options.env; source /etc/environment; echo \"\" >> /run/flannel/options.env; echo \"FLANNEL_PUBLIC_IP=$COREOS_PUBLIC_IPV4\" >> /run/flannel/options.env;'",
                    ].join( "\n" ),
                },
                {
                    "name": "50-network-config.conf",
                    "content": [
                        "[Service]",
                        "ExecStartPre=/usr/bin/etcdctl set /coreos.com/network/config '{ \"Network\": \"10.1.0.0/16\", \"Backend\": { \"Type\": \"udp\", \"Port\": 8285 } }'"
                    ].join( "\n" ),
                }
            ],
            "content": [
                "[Unit]",
                "Description=Network fabric for containers",
                "Documentation=https://github.com/coreos/flannel",
                "Requires=early-docker.service",
                "After=etcd.service etcd2.service early-docker.service",
                // "Before=early-docker.target",
                "",
                "[Service]",
                "Type=notify",
                "Restart=always",
                "RestartSec=5",
                "EnvironmentFile=/etc/environment",
                "Environment=TMPDIR=/var/tmp/",
                "Environment=DOCKER_HOST=unix:///var/run/early-docker.sock",
                "Environment=FLANNEL_VER={{flannel_ver}}",
                "Environment=ETCD_SSL_DIR=/etc/ssl/etcd",
                "LimitNOFILE=40000",
                "LimitNPROC=1048576",
                "ExecStartPre=/sbin/modprobe ip_tables",
                "ExecStartPre=/usr/bin/mkdir -p /run/flannel",
                "ExecStartPre=/usr/bin/mkdir -p ${ETCD_SSL_DIR}",
                "ExecStartPre=/usr/bin/touch /run/flannel/options.env",

                "ExecStart=" + [
                    "/usr/libexec/sdnotify-proxy /run/flannel/sd.sock",
                    "/usr/bin/docker run --net=host --privileged=true --rm",
                        "--volume=/run/flannel:/run/flannel",
                        "--env=NOTIFY_SOCKET=/run/flannel/sd.sock",
                        "--env=AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}",
                        "--env=AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}",
                        "--env-file=/run/flannel/options.env",
                        "--volume=/usr/share/ca-certificates:/etc/ssl/certs:ro",
                        "--volume=${ETCD_SSL_DIR}:/etc/ssl/etcd:ro",
                        "cusspvz/flannel:0.5.2-pre /opt/bin/flanneld",
                            "--ip-masq=true",
                            "--public-ip=${COREOS_PUBLIC_IPV4}",
                ].join(" "),
                "",
                "# Update docker options",
                "ExecStartPost=" + [
                    "/usr/bin/docker run --net=host --rm -v /run:/run",
                        "cusspvz/flannel:0.5.2-pre",
                        "/opt/bin/mk-docker-opts.sh -d /run/flannel_docker_opts.env -i",
                ].join(" "),
            ].join( "\n" ),
        });

        // Make docker wait for flannel
        cloudConfig.addUnit({
            "name": "docker.service",
            "command": "start",
            "drop-ins": [
                {
                    "name": "60-docker-wait-for-flannel-config.conf",
                    "content": [
                        "[Unit]",
                        "After=flanneld.service",
                        "Requires=flanneld.service",
                        "Restart=always",
                        "Restart=on-failure",
                    ].join( "\n" ),
                }
            ],
        });

        debug( 'cloud-config generated' );

        // Save into node
        node.cloudConfig = cloudConfig;

        return cloudConfig;
    },

    isAlive: function () {
        return this.cos.nodeSSHReady( this )
        .then(function ( ssh ) {
            ssh.end();
            return true;
        }, function () {
            return false;
        });
    },

    exists: function () {
        var node = this;
        return node.account.nodeGet( node )
        .then(function () {
            return true;
        }, function () {
            return false;
        });
    },

    waitUntilItsAlive: function ( timeout ) {
        var node = this;
        var started = + new Date();
        timeout = +timeout > 0 && +timeout || 120000;

        debug( 'checking if node %s is alive with a timout of %s ms', node.id, timeout );

        function connect_to_node () {
            debug( 'trying to connect to %s', node.id );

            return node.isAlive()
            .then(function ( alive ) {
                if ( alive ) return;

                var timepassed = new Date() - started;

                if ( timepassed > timeout ) {
                    debug( "timedout, will not retry anymore" );
                    return new Error( "timed out at " + timepassed );
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
    },

    healthCheck: function () {
        var cos = this.cos;
        var node = this;
        var nodes = cos.configGet( 'nodes', {} );
        var FirewallRule = require( './firewall-rule' );

        return Promise.cast()

        .then(function () {
            debug( 'node %s: checking if node exists', node.id );

            return node.exists()
            .then(function ( exists ) {
                if ( exists ) {
                    debug( 'seems so, continuing...' );
                    return;
                }

                throw new Error( "node "+ node.id +" doesn't exist, please destroy it!!" );
            });
        })

        .then(function () {
            debug( 'node %s: updating cloud config', node.id );

            node.generateCloudConfig();
            return node.syncCloudConfig();
        })

        .then(function () {
            debug( 'node %s: setting up ssh firewall rule', node.id );

            new FirewallRule({
                port: node.sshPort,
                protocol: 'tcp',
                cidr: '0.0.0.0/0',
                action: 'ALLOW',
            }) .applyOnNode( node );

        })

        .then(function () {
            debug( 'node %s: setting up etcd2 firewall rules', node.id );

            node.firewallRules = node.firewallRules
            .filter(function ( fr ) {
                return ! (
                    ( fr.port === 2379 || fr.port === 2380 ) &&
                    fr.cidr === '0.0.0.0/0'
                );
            });

            Object.keys( nodes )
            .filter(function ( id ) {
                return id !== node.id;
            })
            .map(function ( id ) {
                return nodes[ id ];
            })
            .map(function ( target ) {
                new FirewallRule({
                    port: 2379,
                    protocol: 'tcp',
                    cidr: target.ip + '/32',
                    action: 'ALLOW',
                }) .applyOnNode( node );
                new FirewallRule({
                    port: 2380,
                    protocol: 'tcp',
                    cidr: target.ip + '/32',
                    action: 'ALLOW',
                }) .applyOnNode( node );
            });

        })
        .then(function () {
            debug( 'node %s: setting up flannel firewall rules', node.id );

            node.firewallRules = node.firewallRules
            .filter(function ( fr ) {
                return ! (
                    fr.port === 8285 &&
                    fr.cidr === '0.0.0.0/0'
                );
            });

            Object.keys( nodes )
            .filter(function ( id ) {
                return id !== node.id;
            })
            .map(function ( id ) {
                return nodes[ id ];
            })
            .map(function ( target ) {
                new FirewallRule({
                    port: 8285,
                    protocol: 'udp',
                    cidr: target.ip + '/32',
                    action: 'ALLOW',
                }) .applyOnNode( node );
            });

        })
        .then(function () {
            debug( 'node %s: syncing firewall rules', node.id );
            return node.syncFirewallRules();
        })

        .then(function () {
            debug( 'node %s: checking if is alive', node.id );
            return node.isAlive()
            .then(function ( alive ) {
                if ( alive ) {
                    debug( 'seems so, continuing...' );
                    return;
                }

                debug( 'node not alive, trying to restart hardware' );
                return cos.nodeRestart( node, true )
                .then(function () {
                    debug( 'node restarted, try to check health in a couple of minutes' );
                }, function () {
                    console.log( 'NODE '+ node.id +' HAS NOT BEEN RESTARTED, WE ADVISE YOU TO CHECK IT MANUALLY' );
                });
            });
        })

        // TODO: check cluster members

        ;
    },

    restart: function ( hardware_reboot ) {
        var node = this;
        var cos = this.cos;

        hardware_reboot = typeof hardware_reboot == 'boolean' ? hardware_reboot : undefined;

        return Promise.try(function () {
            if ( hardware_reboot !== false && Util.is.Function( node.account.nodeRestart ) ) {
                return node.account.nodeRestart();
            }

            if ( hardware_reboot ) {
                throw new Error( "cannot force an hardware_reboot" );
            }

            return cos.nodeExec( node, 'sudo reboot' );
        });
    },

    createSshIdentity: function () {
        debug( 'nodeCreateSshIdentity' );
        var node = this;

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
    },

    bindToConfig: function () {
        var nodes = this.cos.configGet( 'nodes', {} );
        nodes[ this.id ] = this;
        return this;
    },

    unbindFromConfig: function () {
        var nodes = this.cos.configGet( 'nodes', {} );
        delete nodes[ this.id ];
        return this;
    },

    toJSON: function () {
        var node = Util.extend( {}, this );

        delete node.cos;

        var account = node.account;
        node.account = account.id;

        if ( Util.is.Function( account.nodeClean ) ) {
            account.nodeClean( node );
        }

        delete node._initHooksCalled;
        delete node._initHooks;
        delete node._destroyHooks;

        return node;
    },

    // Defaults
    size: 'Small',
    sshPort: 22,
    userName: 'core',
    userPassword: false,
    location: 'North Europe',
    persistent: false,

});

module.exports = Node;
