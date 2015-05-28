var debug = require( 'debug' )( 'coreos:account:remove' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.accountRemove = function ( id ) {
		var account = this.accountGet( id );
		var accounts = this.configGet( 'accounts', {} );

		if ( ! accounts[ account.id ] ) {
			throw new TypeError( "account " + id + " doesn't exist" );
		}

		// store account
		delete accounts[ account.id ];

		debug( "account %s deleted", id );

		return this;
	};

};
