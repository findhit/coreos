var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:account:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.nodeGet = function ( id ) {

		id =
			Util.is.String( node ) && node ||
			Util.is.Object( node ) && node.id ||
			false;

		// check for id
		if ( ! id ) {
			throw new TypeError( "id isnt a string" );
		}

		var nodes = this.configGet( 'nodes', {} );

		if ( ! nodes[ id ] ) {
			throw new Error( "node " + id + " doesn't exist" );
		}

		debug( 'getting account %s', id );

		// store account
		return nodes[ id ];
	};

};
