var Class = require( 'findhit-class' );

var Account = Class.extend({

    options: {
        type: undefined,
        cos: undefined
    },

    initialize: function ( options ) {

        if ( this.constructor === Account ) {
            throw new TypeError( "cannot create account from this class" );
        }

        if ( ! cos ) {
            
        }

    },

    createVM: function ( node ) {

    },

});

module.exports = Account;
