var Util = require( 'findhit-util' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.etcdctl = function( args ) {

        if ( Util.is.Array( args ) ) {
            args.unshift( 'etcdctl' );
        } else if ( Util.is.String( args ) ) {
            args = 'etcdctl' + ' ' + args;
        } else {
            throw new TypeError( "Invalid args type" );
        }

        return this.nodeExec( 'random', args );
    };

};
