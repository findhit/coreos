var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos:account:get' );

module.exports = function ( CoreOsManager ) {

	CoreOsManager.prototype.accountGet = function ( id ) {

		// check for id
		if ( Util.isnt.String( id ) || ! id ) {
			throw new TypeError( "id isnt a string" );
		}

		// Check if it is an UUID32
		if ( ! common.validUUID( id ) ) {
			throw new TypeError( "id isnt a valid uuid" );
		}

		var accounts = this.configGet( 'accounts', {} );

		if ( ! accounts[ id ] ) {
			throw new Error( "account " + id + " doesn't exist" );
		}

		// store account
		return accounts[ id ];
	};

};
