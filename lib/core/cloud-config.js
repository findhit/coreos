var Util = require( 'findhit-util' );
var YAML = require( 'yamljs' );
var debug = require( 'debug' )( 'coreos:core:cloud-config' );

function CloudConfig( obj ) {

    // touch coreos
    this.coreos = {};

    // touch coreos units
    this.coreos.units = [];

    // touch write_files
    this.write_files = [];

    if ( Util.is.Object( obj ) ) {
        // TODO: we must extend it using another method
        Util.extend( this, obj );
    }

}

module.exports = CloudConfig;

CloudConfig.prototype.set = function ( key, value ) {
    debug( 'setting %s as %s', key, value );

    this[ key ] = value;

    return this;
};

CloudConfig.prototype.addUnit = function ( unit ) {
    debug( 'adding unit "%s"', unit.name || 'unit name not defined' );

    this.coreos.units.push( unit );

    return this;
};

CloudConfig.prototype.configure = function ( service, config ) {
    debug( 'configuring service %s', service );

    this.coreos[ service ] = config;

    return this;
};

CloudConfig.prototype.writeFile = function ( file ) {
    debug( 'writing file rule' );

    this.write_files.push( file );

    return this;
};

CloudConfig.prototype.toJSON = function () {
    var obj = {};

    for ( var i in this ) {
        if ( this.hasOwnProperty( i ) ) {
            obj[ i ] = this[ i ];
        }
    }

    return obj;
};

CloudConfig.prototype.toYAML = function () {
    debug( 'stringifying to YAML' );

    var yaml = YAML.stringify( this.toJSON(), Infinity, 4 );

    debug( 'yaml generated' );

    return "#cloud-config" + "\n" + yaml;
};
