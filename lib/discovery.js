var debug = require( 'debug' )( 'coreos:discovery' ),
    request = require('sync-request');

module.exports = function ( CoreOsManager ) {

    CoreOsManager.prototype.options.discovery = false;

    CoreOsManager.prototype.discovery = function ( discovery ) {

        discovery =
            discovery ||
            this.options.discovery ||
            this.config.discovery ||
            request( 'GET', 'https://discovery.etcd.io/new' ).getBody() ||
            undefined;

        if ( ! discovery ) {
            throw new Error( "couldn't determine which discovery url to use" );
        }

        debug( "picking up discovery %s", discovery );

        this.config.discovery = discovery;

        return discovery;
    };

};
