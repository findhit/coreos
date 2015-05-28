var Class = require( 'findhit-class' );
var Util = require( 'findhit-util' );
var CoreOS = require( '../' );

var Account = Class.extend({

    options: {
        type: undefined,
    },

    initialize: function ( options, cos ) {

        if ( this.constructor === Account ) {
            throw new TypeError( "cannot create account from this class" );
        }

        if ( ! cos || Util.isnt.instanceof( CoreOS, cos ) ) {
            throw new TypeError( "invalid cos provided" );
        }

        this.cos = cos;
    },

    nodeCreate: function () {
        throw new TypeError( "please create your account nodeCreate method" );
    },

    nodeDestroy: function () {
        throw new TypeError( "please create your account nodeCreate method" );
    },

    save: function () {

        if ( this.options.id ) {
            return this.resave();
        }

        return this.cos.accountAdd( this.options );
    },

    resave: function () {

        if ( ! this.options.id ) {
            return false;
        }

        this.cos.accountRemove( this.options );
        delete this.options.id;

        return this.cos.accountAdd( this.options );
    }

    destroy: function () {

        if ( ! this.options.id ) {
            return false;
        }

        return this.cos.accountRemove( this.options.id );
    },

});

module.exports = Account;

// Save types for evaluation
Account.Type = require( './type' );
