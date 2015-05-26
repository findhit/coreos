var expect = require( 'expect' ),
	CoreOsAzure = require( '../../index' );

describe( 'Subscription', function(){
	it('List all subscriptions ', function( done ){

		expect( CoreOsAzure.subscriptionList() ).be.ok();

		done();
	});
});
