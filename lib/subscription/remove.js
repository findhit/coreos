var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos-azure:subscription:remove' );

module.exports = function ( CoreOsAzure ) {

	CoreOsAzure.prototype.subscriptionRemove = function ( id ) {

		// check for id
		if ( Util.isnt.String( id ) || ! id ) {
			throw new TypeError( "id isnt a string" );
		}

		// Check if it is an UUID32
		if ( ! common.validUUID( id ) ) {
			throw new TypeError( "id isnt a valid uuid" );
		}

		var subscriptions = this.configGet( 'subscriptions', {} );

		if ( ! subscriptions[ id ] ) {
			throw new TypeError( "subscription " + id + " doesn't exist" );
		}

		// store subscription
		delete subscriptions[ id ];

		debug( "subscription %s deleted", id );

		return this;
	};

};
