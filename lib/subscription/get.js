var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos-azure:subscription:add' );

module.exports = function ( CoreOsAzure ) {

	CoreOsAzure.prototype.subscriptionGet = function( id ) {

		// check for id
		if ( Util.isnt.String( id ) || !id ) {
			throw new TypeError( "id isnt a string" );
		}

		// Unnecessary UUID32 validation

		var subscriptions = this.configGet( 'subscriptions', {} );

		if ( !subscriptions[ id ] ) {
			throw new TypeError( "subscription " + id + " doesn't exist" );
		}

		// store subscription
		return subscriptions[ id ];
	};

};
