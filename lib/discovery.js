var request = require('sync-request');
var debug = require( 'debug' )( 'coreos:discovery' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.options.discovery = false;

    CoreOS.prototype.discoveryNew = function () {
        // Before gathering a new URL, we must have sure that there aren't nodes
        // on your config, otherwise cluster will be messed up!
        //
        var nodes = this.nodeList();

        if ( Object.keys( nodes ).length !== 0 ) {
            throw new Error([

                "Seems that you or someone on NSA asked to generate a new",
                "discovery url.",
                "Thats fine for me, but it also seems that you have a cluster",
                "initialized, meaning you will have double trouble if i continue",
                "what i was supposed to do.",
                "Please reset \"discovery\" key on your config or kill your",
                "current cluster by running `coreos kill` command."

            ].join( ' ' ));
        }

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
