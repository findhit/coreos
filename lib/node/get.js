var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:node:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.nodeGet = function ( id ) {

		id =
			Util.is.String( id ) && id ||
			Util.is.Object( id ) && id.id ||
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
