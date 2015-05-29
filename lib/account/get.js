var Util = require( 'findhit-util' );
var Account = require( './class' );
var debug = require( 'debug' )( 'coreos:account:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountGet = function ( id ) {

		id = id instanceof Account && id.id || id || false;

		// check for id
		if ( ! id ) {
			throw new TypeError( "id isnt valid" );
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
