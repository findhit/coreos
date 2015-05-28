var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:account:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountGet = function ( id ) {

		// check for id
		if ( Util.isnt.String( id ) || ! id ) {
			throw new TypeError( "id isnt a string" );
		}

		var accounts = this.configGet( 'accounts', {} );

		if ( ! accounts[ id ] ) {
			throw new Error( "account " + id + " doesn't exist" );
		}

		debug( 'getting account %s', id );

		// store account
		return accounts[ id ];
	};

};
