var expect = require( 'expect' ),
	CoreOsAzure = require( '../../index' );

describe( 'Subscription', function(){
	it('Get subscription ', function( done ){

		expect( CoreOsAzure.subcriptionGet( '4d36e96e-e325-11ce-bfc1-08002be10318' ) ).be.ok();

		done();
	});
});
