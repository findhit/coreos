var Util = require( 'findhit-util' );
var Account = require( './class' );
var debug = require( 'debug' )( 'coreos:account:add' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountAdd = function( account ) {

		// check if it is an object
		if ( ! ( account instanceof Account ) ) {
			throw new TypeError( "account isnt a valid Account object" );
		}

		// check for id
		if ( account.id ) {
			throw new TypeError( "account.id is already set" );
		}

		// Generate an id for this account
		account.id = account.uniqId();

		var accounts = this.configGet( 'accounts', {} );

		debug( "adding account %s into config", account.id );

		// store account
		accounts[ account.id ] = account;

		return this;
	};

};
