var Util = require( 'findhit-util' );
var fs = require( 'fs' );
var path = require( 'path' );
var debug = require( 'debug' )( 'coreos:config' );

var curPath = path.dirname( require.main.filename );
var homePath = process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || process.cwd();

module.exports = function ( CoreOS ) {

    /**
     * configPath - required
     *
     * config file path that will be used by coreos for saving cloud
     * relative settings such as certificates, nodes data, and so on.
     *
     * @{String}
     */
    CoreOS.prototype.options.configPath = false;


    /**
     * loadConfigOnInit - required
     *
     * defines if method `configLoad` should run on initialize
     *
     * @{Boolean}
     */
    CoreOS.prototype.options.loadConfigOnInit = true;

    CoreOS.prototype.configTry = function ( path, setPath ) {
        var config;

        if ( ! path ) {
            return false;
        }

        try {
            config = require( path );
        } catch ( err ) {
            return false;
        }

        if ( Util.isnt.Object( config ) ) {
            return false;
        }

        if ( setPath !== false ) {
            this.configPath = path;
        }

        debug( 'readed config from %s', path );

        return config;
    },

    CoreOS.prototype.configLoad = function ( path ) {
        var config;

        this.config =
            path && this.configTry( path ) ||
            this.configTry( this.options.config ) ||
            this.configTry( curPath + '/.coreos.json' ) ||
            this.configTry( homePath + '/.coreos.json' ) ||
            {};

    };

    CoreOS.prototype.configGet = function ( key, default_value ) {
        if ( this.config[ key ] ) {
            return this.config[ key ];
        }

        this.config[ key ] = default_value;

        return this.config[ key ];
    };

    CoreOS.prototype.configJSON = function () {
        return JSON.stringify(
            this.config,
            "\n",
            "    "
        );
    };

    CoreOS.prototype.configSave = function () {
        var configPath = this.configPath || homePath + '/.coreos.json';

        debug( 'saving config into %s', configPath );

        fs.writeFileSync(
            configPath,
            this.configJSON()
        );
    };

    CoreOS.addInitHook(function () {
        var options = this.options;

        if ( options.loadConfigOnInit ) {
            this.configLoad();
        } else {
            this.config = {};
        }

    });

};
