var chai = require( 'chai' );
var expect = chai.expect;
var CoreOS = require( '../../' );

describe( "account", function () {
describe( "list", function () {

	beforeEach(function () {
		this.cos = new CoreOS();
	});

	it( "should get accounts from config", function () {
		var accounts = this.cos.configGet( 'accounts', {} );
        expect(
            this.cos.accountList()
        ).to.be.equal( accounts );
    });

});
});
