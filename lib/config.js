var Util = require( 'findhit-util' ),
    fs = require( 'fs' );

module.exports = function ( CoreOsManager ) {

    /**
     * configPath - required
     *
     * config file path that will be used by coreos for saving cloud
     * relative settings such as certificates, nodes data, and so on.
     *
     * @{String}
     */
    CoreOsManager.prototype.options.configPath = '~/.coreos.json';


    /**
     * loadConfigOnInit - required
     *
     * defines if method `configLoad` should run on initialize
     *
     * @{Boolean}
     */
    CoreOsManager.prototype.options.loadConfigOnInit = true;


    CoreOsManager.prototype.configLoad = function () {
        try {
            this.config = require( this.options.configPath );

            if ( Util.isnt.Object( this.config ) ) {
                this.config = {};
            }
        } catch ( err ) {
            this.config = {};
        }
    };

    CoreOsManager.prototype.configGet = function ( key, default_value ) {
        if ( this.config[ key ] ) {
            return this.config[ key ];
        }

        this.config[ key ] = default_value;

        return this.config[ key ];
    };

    CoreOsManager.prototype.configSave = function () {
        fs.writeFileSync( this.options.configPath, JSON.stringify( this.config ) );
    };

    CoreOsManager.addInitHook(function () {
        var options = this.options;

        if ( options.loadConfigOnInit ) {
            this.configLoad();
        }
    });

};
