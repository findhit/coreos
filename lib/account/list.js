var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:account:list' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountList = function () {

		debug( "Returning all accounts" );
		var accounts = this.configGet( 'accounts', {} );

		return accounts;
	};

};
