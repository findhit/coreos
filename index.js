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

    require( 'lib/init' )( CoreOsAzure );
    require( 'lib/config' )( CoreOsAzure );
    require( 'lib/discovery' )( CoreOsAzure );

    // subscription
    require( 'lib/subscription/list' )( CoreOsAzure );
    require( 'lib/subscription/add' )( CoreOsAzure );
    require( 'lib/subscription/get' )( CoreOsAzure );
    require( 'lib/subscription/remove' )( CoreOsAzure );

    // nodes
    require( 'lib/node/list' )( CoreOsAzure );
    require( 'lib/node/create' )( CoreOsAzure );
    require( 'lib/node/get' )( CoreOsAzure );
    require( 'lib/node/ssh' )( CoreOsAzure );
    require( 'lib/node/destroy' )( CoreOsAzure );

    // certificate
    require( 'lib/certificate/list' )( CoreOsAzure );
    require( 'lib/certificate/create' )( CoreOsAzure );
    require( 'lib/certificate/destroy' )( CoreOsAzure );

    // deploy
    require( 'lib/deploy/service' )( CoreOsAzure );
    require( 'lib/deploy/docker' )( CoreOsAzure );
