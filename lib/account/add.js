var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos:account:add' );

module.exports = function ( CoreOsManager ) {

	CoreOsManager.prototype.accountAdd = function( account ) {

		// check if it is an object
		if ( Util.isnt.Object( account ) ) {
			throw new TypeError( "account isnt an object" );
		}

		// check for id
		if ( Util.isnt.String( account.id ) || ! account.id ) {
			throw new TypeError( "account.id isnt a string" );
		}

		// Check if it is an UUID32
		if ( ! common.validUUID( account.id ) ) {
			throw new TypeError( "account.id isnt a valid uuid" );
		}

		var accounts = this.configGet( 'accounts', {} );

		if ( accounts[ account.id ] ) {
			throw new TypeError( "we already have this account" );
		}

		debug( "adding account %s into config", account.id );

		// store account
		accounts[ account.id ] = account;

		return this;
	};

};
