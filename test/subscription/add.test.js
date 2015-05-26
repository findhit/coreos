var expect = require( 'expect' ),
	CoreOsAzure = require( '../../index' );

describe( 'Subscription', function(){
	it('Create subscription ', function( done ){
		CoreOsAzure.subcriptionAdd( '4d36e96e-e325-11ce-bfc1-08002be10318' );

		expect( CoreOsAzure.subcriptionGet( '4d36e96e-e325-11ce-bfc1-08002be10318' ) ).be.ok();

		done();
	});
});
