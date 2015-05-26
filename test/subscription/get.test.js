var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../../' );

describe( "Subscription", function (){
describe( "subscription", function () {
describe( "get", function () {

	beforeEach(function () {
		this.cos = new CoreOsAzure();
	});

	it( "should get a subscription from config", function (){

		var subscriptions = this.cos.configGet( 'subscriptions', {} );
		var subscription = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

        // Add manually
        subscriptions[ subscription.id ] = subscription;

		expect(
            this.cos.subscriptionGet(
                '4d36e96e-e325-11ce-bfc1-08002be10318'
            )
        ).to.be.equal( subscription );

	});

    it( "should throw an error if no id was provided", function () {
        expect(function () {
            return this.cos.subscriptionGet();
        }).to.throw( TypeError );
    });

    it( "should throw an error if id isnt a valid uuid", function () {
        expect(function () {
            return this.cos.subscriptionGet(
                '4d36e96'
            );
        }).to.throw( TypeError );
    });

    it( "should throw an error if there is none", function () {
        expect(function () {
            return this.cos.subscriptionGet(
                '4d36e96e-e325-11ce-bfc1-08002be10318'
            );
        }).to.throw( Error );
    });

});
});
});
