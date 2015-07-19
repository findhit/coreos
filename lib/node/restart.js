var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.nodeRestart = function ( node, hardware_reboot ) {
        var cos = this;
        var node = this.nodeGet( node );

        return Promise.try(function () {
            if ( Util.is.Function( node.account.nodeRestart ) ) {
                return node.account.nodeRestart();
            }

            if ( hardware_reboot ) {
                throw new Error( "cannot force an hardware_reboot" );
            }

            return cos.nodeExec( node, 'sudo reboot' );
        });
    };

};
