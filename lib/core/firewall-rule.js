var Util = require( 'findhit-util' );
var Class = require( 'findhit-class' );
var Node = require( './node' );
var debug = require( 'debug' )( 'coreos:core:port-rule' );

Node.addInitHook(function () {
    var node = this;

    node.firewallRules =
        Util.is.Array( node.firewallRules ) && node.firewallRules ||
        [];

    node.firewallRules = node.firewallRules.map(function ( data ) {
        return new FirewallRule( data );
    });

});

var FirewallRule = Class.extend({

    statics: {
        s: [],
        Protocols: [
            'TCP',
            'UDP'
        ],
        Actions: [
            'ALLOW',
            'DENY'
        ],
        CIDR: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/
    },

    initialize: function ( options ) {
        if ( Util.is.instanceof( FirewallRule, options ) ) {
            return options;
        }

        if ( Util.isnt.Object( options ) ) {
            throw new TypeError( "invalid options provided" );
        }

        // arguments validations
        if ( ! FirewallRule.Protocols.indexOf( options.protocol ) === -1 ) {
            throw new TypeError( "invalid options.protocol provided" );
        }

        if ( !+options.port || +options.port < 1 || +options.port > 65535 ) {
            throw new TypeError( "invalid options.port provided" );
        }

        if ( options.action && FirewallRule.Actions.indexOf( options.action ) === -1 ) {
            throw new TypeError( "invalid options.action provided" );
        }

        if ( Util.is.String( options.cidr ) && options.cidr && ! options.cidr.match( FirewallRule.CIDR ) ) {
            throw new TypeError( "invalid options.cidr provided" );
        }

        // data store
        this.protocol = options.protocol;
        this.port = +options.port;
        this.action = options.action || 'ALLOW';
        this.cidr = Util.is.String( options.cidr ) && options.cidr || '0.0.0.0/0';

        this.id = [
            this.protocol,
            this.port,
            this.action,
            this.cidr
        ].join( '_' );

        // Cache handling
        if ( FirewallRule.s[ this.id ] ) {
            return FirewallRule.s[ this.id ];
        } else {
            FirewallRule.s[ this.id ] = this;
        }

        // instance return
        return this;
    },

    toJSON: function () {
        return {
            protocol: this.protocol,
            port: this.port,
            action: this.action,
            cidr: this.cidr,
        }
    },

    applyOnNode: function ( node ) {
        var i = node.firewallRules.indexOf( this );

        if ( i === -1 ) {
            node.firewallRules.push( this );
        }

        return this;
    },

    removeFromNode: function ( node ) {
        var i = node.firewallRules.indexOf( this );

        if ( i !== -1 ) {
            node.firewallRules.splice( i, 1 );
        }

        return this;
    }

});

module.exports = FirewallRule;
