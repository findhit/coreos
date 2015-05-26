var Class = require( 'findhit-class' ),
    Util = require( 'findhit-util' ),
    fs = require( 'fs' );

var CoreOsAzure = Class.extend({

    commands: {
    },

    options: {


        /**
         * configPath - required
         *
         * config file path that will be used by coreos-azure for saving cloud
         * relative settings such as certificates, nodes data, and so on.
         *
         * {String}
         */
        configPath: '~/.coreos-azure.json',

        /**
         * @subscription - required
         *
         * Microsoft Azure current subcription key
         * It must be already configured onto azure-cli
         *
         * {String}
         */
        subscription: undefined,


        discovery: 'new', // by default it should gather always one new

    },

    initialize: function ( options ) {
        options = this.setOptions( options );

        // Load config
        this.configLoad();
    },

    //
    // Config related
    //

    configLoad: function () {
        try {
            this.config = require( this.options.configPath );

            if ( Util.isnt.Object( this.config ) ) {
                this.config = {};
            }
        } catch ( err ) {
            this.config = {};
        }
    },

    configGet: function ( key, default_value ) {
        if ( this.config[ key ] ) {
            return this.config[ key ];
        }

        this.config[ key ] = default_value;

        return this.config[ key ];
    },

    configSave: function () {
        fs.writeFileSync( this.options.configPath, JSON.stringify( this.config ) );
    },

});

// Extend with libs

    require( 'lib/init' )( CoreOsAzure );

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
