var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.kill = function () {
        var cos = this;

        // resets cluster by deleting all nodes and discovery
        // please be sure that you know what you're doing, there is not way back
        var nodes = cos.nodeList();

        return Promise.props( Util.Object.map( nodes, function ( node ) {
            return cos.nodeDestroy( node );
        }))
        .then(function () {
            delete cos.config.discovery;
        });
    };

};
