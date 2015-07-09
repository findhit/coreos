var Util = require( 'findhit-util' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.fleetctl = function( args ) {

        if ( Util.is.Array( args ) ) {
            args.unshift( 'fleetctl', '--endpoint=http://localhost:2379' );
        } else if ( Util.is.String( args ) ) {
            args = 'fleetctl --endpoint=http://localhost:2379 ' + args;
        } else {
            throw new TypeError( "Invalid args type" );
        }

        var nodes = this.configGet( 'nodes', {} );
        var node = Object.keys( nodes )
        .map(function ( id ) {
            return nodes[ id ];
        })
        .filter(function ( node ) {
            return node.role === 'services';
        })
        [ 0 ];

        return this.nodeExec( node, args );
    };

};
