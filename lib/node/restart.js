var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.nodeRestart = function ( node, hardware_reboot ) {
        var cos = this;

        node = this.nodeGet( node );

        return node.restart( hardware_reboot );
    };

};
