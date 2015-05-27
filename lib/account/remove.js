var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos:account:remove' );

module.exports = function ( CoreOsManager ) {

	CoreOsManager.prototype.accountRemove = function ( id ) {

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
			throw new TypeError( "account " + id + " doesn't exist" );
		}

		// store account
		delete accounts[ id ];

		debug( "account %s deleted", id );

		return this;
	};

};
