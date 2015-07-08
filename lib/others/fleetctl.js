var Util = require( 'findhit-util' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.fleetctl = function( args ) {

        if ( Util.is.Array( args ) ) {
            args.unshift( 'fleetctl' );
        } else if ( Util.is.String( args ) ) {
            args = 'fleetctl' + ' ' + args;
        } else {
            throw new TypeError( "Invalid args type" );
        }

        return this.nodeExec( 'random', args );
    };

};
