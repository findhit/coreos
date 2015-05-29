var request = require('sync-request');
var debug = require( 'debug' )( 'coreos:discovery' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.options.discovery = false;

    CoreOS.prototype.discoveryNew = function () {
        debug( "attemping to get a new discovery url" );
        return request( 'GET', 'https://discovery.etcd.io/new' ).getBody() + '';
    };

    CoreOS.prototype.discovery = function ( discovery ) {

        discovery =
            discovery ||
            this.options.discovery ||
            this.config.discovery ||
            this.discoveryNew() ||
            undefined;

        if ( ! discovery ) {
            throw new Error( "couldn't determine which discovery url to use" );
        }

        debug( "setting up discovery %s", discovery );

        this.config.discovery = discovery;
        return discovery;
    };

};
