var expect = require( 'expect' ),
	CoreOsAzure = require( '../../index' );

describe( 'Subscription', function(){
	it('Remove subscription ', function( done ){

		expect( CoreOsAzure.subcriptionRemove( '4d36e96e-e325-11ce-bfc1-08002be10318' ) ).be.ok();

		done();
	});
});
