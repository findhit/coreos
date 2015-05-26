var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos-azure:subscription:add' );

module.exports = function ( CoreOsAzure ) {

	CoreOsAzure.prototype.subscriptionList = function() {

		debug( "Returning all subscriptions" );
		var subscriptions = this.configGet( 'subscriptions', {} );

		return subscriptions;
	};

};
