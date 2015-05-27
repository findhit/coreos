var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsManager = require( '../../' );

describe( "account", function () {
describe( "list", function () {

	beforeEach(function () {
		this.cos = new CoreOsManager();
	});

	it( "should get accounts from config", function () {
		var accounts = this.cos.configGet( 'accounts', {} );
        expect(
            this.cos.accountList()
        ).to.be.equal( accounts );
    });

});
});
