var Util = require( 'findhit-util' );
var Account = require( '../account/class' );
var Promise = require( 'bluebird' );
var debug = require( 'debug' )( 'coreos:node:create' );
var Node = require( '../core/node' );
var FirewallRule = require( '../core/firewall-rule' );
var CloudConfig = require( '../core/cloud-config' );

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
                return node.account.nodeCreate( node );
            })
            .tap(function () {
                node.bindToConfig();
            });

        })
        .delay( 10000 )
        .return( node );
    };

};
