var Util = require( 'findhit-util' ),
    fs = require( 'fs' );

module.exports = function ( CoreOsAzure ) {

    /**
     * configPath - required
     *
     * config file path that will be used by coreos-azure for saving cloud
     * relative settings such as certificates, nodes data, and so on.
     *
     * @{String}
     */
    CoreOsAzure.prototype.options.configPath = '~/.coreos-azure.json';


    /**
     * loadConfigOnInit - required
     *
     * defines if method `configLoad` should run on initialize
     *
     * @{Boolean}
     */
    CoreOsAzure.prototype.options.loadConfigOnInit = true;


    CoreOsAzure.prototype.configLoad = function () {
        try {
            this.config = require( this.options.configPath );

            if ( Util.isnt.Object( this.config ) ) {
                this.config = {};
            }
        } catch ( err ) {
            this.config = {};
        }
    };

    CoreOsAzure.prototype.configGet = function ( key, default_value ) {
        if ( this.config[ key ] ) {
            return this.config[ key ];
        }

        this.config[ key ] = default_value;

        return this.config[ key ];
    };

    CoreOsAzure.prototype.configSave = function () {
        fs.writeFileSync( this.options.configPath, JSON.stringify( this.config ) );
    };

    CoreOsAzure.addInitHook(function () {
        var options = this.options;

        if ( options.loadConfigOnInit ) {
            this.configLoad();
        }
    });

};
