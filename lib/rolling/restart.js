var debug = require( 'debug' )( 'coreos:rolling:restart' );
var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );

var defaultOptions = {
    interval: 30 // secs
};

module.exports = function ( CoreOS ) {

    CoreOS.prototype.rollingRestart = function( options ) {
        var cos = this;
        var nodes = cos.configGet( 'nodes', {} );

        options = Util.is.Object( options ) && options || {};
        options.__proto__ = defaultOptions;

        var interval = options.interval || 60;

        debug( 'interval set to %s seconds', interval );

        return Promise.all( Object.keys( nodes ) )
        .each(function ( id ) {
            var node = nodes[ id ];

            debug( 'restarting node %s', id );
            return cos.nodeRestart( node )
            .delay( interval * 1000 );
        });
    };

};
