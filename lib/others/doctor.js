var debug = require( 'debug' )( 'coreos:doctor' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.doctor = function() {
        var nodes = this.configGet( 'nodes', {} );

        var promises = Object.keys( nodes )
        .map(function ( id ) {
            var node = nodes[ id ];

            return node.healthCheck();
        })

        return Promise.all( promises );
    };

};
