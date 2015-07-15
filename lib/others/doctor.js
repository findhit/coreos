var debug = require( 'debug' )( 'coreos:doctor' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.doctor = function() {
        var nodes = this.configGet( 'nodes', {} );

        var promises = Object.keys( nodes )
        .map(function ( id ) {
            return nodes[ id ];
        })
        .map(function ( node ) {
            // ensure node has ip
            if ( ! node.ip ) {
                node.getIpFromHost();
            }

            return node.healthCheck();
        })

        return Promise.all( promises );
    };

};
