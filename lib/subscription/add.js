var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos-azure:subscription:add' );

module.exports = function ( CoreOsAzure ) {

	CoreOsAzure.prototype.subscriptionAdd = function( subscription ) {

		// check if it is an object
		if ( Util.isnt.Object( subscription ) ) {
			throw new TypeError( "subscription isnt an object" );
		}

		// check for id
		if ( Util.isnt.String( subscription.id ) || ! subscription.id ) {
			throw new TypeError( "subscription.id isnt a string" );
		}

		// Check if it is an UUID32
		if ( ! common.validUUID( subscription.id ) ) {
			throw new TypeError( "subscription.id isnt a valid uuid" );
		}

		var subscriptions = this.configGet( 'subscriptions', {} );

		if ( subscriptions[ subscription.id ] ) {
			throw new TypeError( "we already have this subscription" );
		}

		debug( "adding subscription %s into config", subscription.id );

		// store subscription
		subscriptions[ subscription.id ] = subscription;

		return this;
	};

};
