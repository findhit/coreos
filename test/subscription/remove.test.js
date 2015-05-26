var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../../' );

describe( "Subscription", function (){
describe( "subscription", function () {
describe( "list", function () {

	beforeEach(function () {
		this.cos = new CoreOsAzure();
	});

	it( "should get subscriptions from config", function () {
        var self = this;
		var subscriptions = this.cos.configGet( 'subscriptions', {} );
		var subscription = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

        // Add manually
        subscriptions[ subscription.id ] = subscription;

        expect(function () {
            self.cos.subscriptionRemove(
                subscription.id
            );
        }).to.not.throw( Error );

        expect( subscriptions[ subscription.id ] ).to.be.equal( undefined );
    });

    it( "should throw an error if no id is provided", function () {
        var self = this;
        expect(function () {
            return self.cos.subscriptionRemove();
        }).to.throw( TypeError );
    });

    it( "should throw an error if id isnt a valid uuid", function () {
        expect(function () {
            return this.cos.subscriptionRemove(
                '4d36e96'
            );
        }).to.throw( TypeError );
    });

});
});
});
