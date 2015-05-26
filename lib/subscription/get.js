var Util = require( 'findhit-util' ),
	common = require( './common' ),
	debug = require( 'debug' )( 'coreos-azure:subscription:get' );

module.exports = function ( CoreOsAzure ) {

	CoreOsAzure.prototype.subscriptionGet = function ( id ) {

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
			throw new Error( "subscription " + id + " doesn't exist" );
		}

		// store subscription
		return subscriptions[ id ];
	};

};
