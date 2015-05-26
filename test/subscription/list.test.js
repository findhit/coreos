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
		var subscriptions = this.cos.configGet( 'subscriptions', {} );
        expect(
            this.cos.subscriptionList()
        ).to.be.equal( subscriptions );
    });

});
});
});
