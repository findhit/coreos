var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../../' );

describe( "Subscription", function (){
describe( "subscription", function () {
describe( "add", function () {

	beforeEach(function () {
		this.cos = new CoreOsAzure();
	});

	it( "should add subscription to subscriptions", function (){

		var subscriptions = this.cos.configGet( 'subscriptions', {} );
		var subscription = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

		this.cos.subscriptionAdd( subscription );

		expect( subscriptions[ subscription.id ] ).to.be.equal( subscription );
	});

	it( "should throw an error if we try to add a string", function () {
		var self = this;

		expect(function () {
			return self.subcriptionAdd( 'test' );
		}).to.throw( TypeError );
	});

	it( "should throw an error if subscription id isn't a valid uuid", function () {
		var self = this;

		expect(function () {
			return self.subcriptionAdd({
				id: 'test',
			});
		}).to.throw( TypeError );
	});

});
});
});
