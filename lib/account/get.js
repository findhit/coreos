var Util = require( 'findhit-util' );
var Account = require( './class' );
var debug = require( 'debug' )( 'coreos:account:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountGet = function ( id ) {
		var accounts = this.configGet( 'accounts', {} );
        var accountsIds = Object.keys( accounts );

		var account =
			id === 'random' && accounts[ accountsIds[ Math.floor( Math.random() * accountsIds.length ) ] ] ||
			typeof id === 'number' && accounts[ accountsIds[ id % accountsIds.length ] ] ||
			id instanceof Account && id ||
			accounts[ id ] ||
			false;

		// check for id
		if ( ! account ) {
			throw new TypeError( "account isnt valid" );
		}

		debug( 'getting account %s', account.id );

		return account;
	};

};
