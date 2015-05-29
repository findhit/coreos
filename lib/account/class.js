var Class = require( 'findhit-class' );
var Util = require( 'findhit-util' );
var CoreOS = require( '../' );

CoreOS.addInitHook(function () {
    var cos = this;

    if ( Util.is.Object( cos.config.accounts ) ) {
        cos.config.accounts = Util.Object.map( cos.config.accounts, function ( data ) {

            if ( ! data.provider || ! Account.Provider[ data.provider ] ) {
                throw new Error( "cannot initialize account provider from data" );
            }

            return Account.Provider[ data.provider ]( data, cos );
        });
    }

});

var Account = Class.extend({

    statics: {
        copy: [
            'provider',
        ]
    },

    initialize: function ( data, cos ) {

        if ( this.constructor === Account ) {
            throw new TypeError( "cannot create account from this class" );
        }

        if ( ! cos || Util.isnt.instanceof( CoreOS, cos ) ) {
            throw new TypeError( "invalid cos provided" );
        }

        // Just because we could need to interact with CoreOS instance
        this.cos = cos;

        Util.extend( this, data );

        // Add current constructor name into options
        this.provider = this.constructor.provider;

        if ( ! this.provider ) {
            throw new Error( "please provide a provider name on your account constructor" );
        }
    },

    uniqId: function () {
        // I don't advise you to create your own generator based on your
        // provider's id.
        return Util.uniqId();
    },

    save: function () {

        if ( this.id ) {
            return this.resave();
        }

        return this.cos.accountAdd( this );
    },

    resave: function () {

        if ( ! this.id ) {
            return false;
        }

        this.cos.accountRemove( this );
        delete this.id;

        return this.cos.accountAdd( this );
    },

    destroy: function () {

        if ( ! this.id ) {
            return false;
        }

        return this.cos.accountRemove( this.id );
    },

    setAsCurrent: function () {
        this.cos.accountCurrent( this );
    },

    toJSON: function () {
        var res = {};
        var account = this;
        var copy = this.constructor.copy;

        if ( Util.isnt.Array( copy ) ) {
            throw new TypeError( "please provide a copy array on your constructor" );
        }

        copy.forEach(function ( key ) {
            if ( typeof account[ key ] !== 'undefined' ) {
                res[ key ] = account[ key ];
            }
        });

        return res;
    },

    // methods that are needed by core to deploy coreos cluster into different
    // cloud providers

    nodeCreate: function () {
        throw new TypeError( "please create your account nodeCreate method" );
    },

    nodeDestroy: function () {
        throw new TypeError( "please create your account nodeCreate method" );
    },

});

module.exports = Account;

// Save types for evaluation
Account.Provider = require( './provider' );
