var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../../' );

describe( "subscription", function () {
describe( "current", function () {

	beforeEach(function () {
		var cos = this.cos = new CoreOsAzure();
        var subscription = this.subscription = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

		cos.subscriptionAdd( subscription );
	});

	it( "should allow us to set current from .subscriptionCurrent", function (){

        this.cos.subscriptionCurrent( this.subscription.id );

        expect(
            this.cos.subscriptionCurrent()
        ).to.be.equal( this.subscription );
    });

    it("should allow us to set current from options", function (){
        this.cos.options.currentSubscription = this.subscription.id;

        expect(
            this.cos.subscriptionCurrent()
        ).to.be.equal( this.subscription );
    });

    it("should allow us to set current from config", function (){
        this.cos.config.currentSubscription = this.subscription.id;

        expect(
            this.cos.subscriptionCurrent()
        ).to.be.equal( this.subscription );
    });

});
});
