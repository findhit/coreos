var Util = require( 'findhit-util' );
var Account = require( '../account/class' );
var Promise = require( 'bluebird' );
var debug = require( 'debug' )( 'coreos:node:create' );
var Node = require( '../core/node' );
var FirewallRule = require( '../core/firewall-rule' );
var CloudConfig = require( '../core/cloud-config' );

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

module.exports = function ( CoreOS ) {

    CoreOS.prototype.nodeCreate = function ( options ) {
        var cos = this;

        // Handle options inherit
        options = Util.is.Object( options ) && options || {};

        var nodes = cos.configGet( 'nodes', {} );

        // Initialize node object
        var node = new Node({
            account: options.account,
            host: null, // should be handled by account
            size: options.size || 'Small',
            role: options.role,

            userName: options.userName,
            userPassword: options.userPassword,
            location: options.location,
            persistent: options.persistent,
            sshPort: options.sshPort,

            group: options.group,

        }, cos );

        return Promise.try(function () {

            // check for nodes
            if ( Object.keys( nodes ).length === 0 && ! options.bootstrap ) {
                throw new Error( "use bootstrap instead to start a cluster" );
            }

            if ( options.group ) node.group = options.group;

            if ( groups.indexOf( node.group ) === -1 ) {
                throw new TypeError( "invalid group provided" );
            }

            if ( node.role === 'worker' && Object.keys( nodes ).length === 0 ) {
                throw new Error( "cannot add a worker node as a cluster startup" );
            }

            // TODO: check if is beeing used
            // Check if there is an object called node into options so we can
            // override node object properties
            if ( Util.is.Object( options.node ) ) {
                Util.extend( node, options.node );
            }

            // Generate node's cloudconfig
            node.generateCloudConfig();

            return options.simulate ? node :
            Promise.cast( node )
            .tap(function () {
                debug( 'creating identity' );
                return node.createSshIdentity();
            })
            .tap(function () {
                debug( 'creating node' );
                return account.nodeCreate( node );
            })

            .tap(function () {
                node.bindToConfig();
            });

        })
        .delay( 10000 )
        .return( node );
    };

};
