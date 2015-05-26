var Class = require( 'findhit-class' );

var CoreOsAzure = Class.extend({

    commands: {
    },

    options: {

        /**
         * @subscription - required
         *
         * Microsoft Azure current subcription key
         * It must be already configured onto azure-cli
         *
         * {String}
         */
        subscription: undefined,

    },

    initialize: function ( options ) {
        options = this.setOptions( options );
    },

});

// Extend with libs

    require( './init' )( CoreOsAzure );
    require( './config' )( CoreOsAzure );
    require( './discovery' )( CoreOsAzure );

    // subscription
    require( './subscription/list' )( CoreOsAzure );
    require( './subscription/add' )( CoreOsAzure );
    require( './subscription/get' )( CoreOsAzure );
    require( './subscription/remove' )( CoreOsAzure );

    // nodes
    require( './node/list' )( CoreOsAzure );
    require( './node/create' )( CoreOsAzure );
    require( './node/get' )( CoreOsAzure );
    require( './node/ssh' )( CoreOsAzure );
    require( './node/destroy' )( CoreOsAzure );

    // certificate
    require( './certificate/list' )( CoreOsAzure );
    require( './certificate/create' )( CoreOsAzure );
    require( './certificate/destroy' )( CoreOsAzure );

    // deploy
    require( './deploy/service' )( CoreOsAzure );
    require( './deploy/docker' )( CoreOsAzure );

// Export it
module.exports = CoreOsAzure;
