var chai = require( 'chai' );
var expect = chai.expect;
var CoreOS = require( '../../' );

describe( "account", function () {
describe( "add", function () {

	beforeEach(function () {
		this.cos = new CoreOS();
	});

	it( "should add account to accounts", function (){

		var accounts = this.cos.configGet( 'accounts', {} );
		var account = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

		this.cos.accountAdd( account );

		expect( accounts[ account.id ] ).to.be.equal( account );
	});

	it( "should throw an error if we try to add a string", function () {
		var self = this;

		expect(function () {
			return self.subcriptionAdd( 'test' );
		}).to.throw( TypeError );
	});

	it( "should throw an error if account id isn't a valid uuid", function () {
		var self = this;

		expect(function () {
			return self.subcriptionAdd({
				id: 'test',
			});
		}).to.throw( TypeError );
	});

});
});
