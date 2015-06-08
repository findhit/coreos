var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.kill = function () {
        var cos = this;

        // resets cluster by deleting all nodes
        // please be sure that you know what you're doing, there is not way back
        var nodes = cos.nodeList();



        return Promise.try(function () {
            var promise = Promise.cast();

            Util.Object.each( nodes, function ( node ) {
                promise = promise
                .then(function () {
                    return cos.nodeDestroy( node );
                });
            });

            return promise;
        });
    };

};
