var chai = require( 'chai' );
var expect = chai.expect;
var CoreOS = require( '../../' );

describe( "account", function () {
describe( "get", function () {

	beforeEach(function () {
		this.cos = new CoreOS();
	});

	it( "should get a account from config", function (){

		var accounts = this.cos.configGet( 'accounts', {} );
		var account = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

        // Add manually
        accounts[ account.id ] = account;

		expect(
            this.cos.accountGet(
                '4d36e96e-e325-11ce-bfc1-08002be10318'
            )
        ).to.be.equal( account );

	});

    it( "should throw an error if no id was provided", function () {
        expect(function () {
            return this.cos.accountGet();
        }).to.throw( TypeError );
    });

    it( "should throw an error if id isnt a valid uuid", function () {
        expect(function () {
            return this.cos.accountGet(
                '4d36e96'
            );
        }).to.throw( TypeError );
    });

    it( "should throw an error if there is none", function () {
        expect(function () {
            return this.cos.accountGet(
                '4d36e96e-e325-11ce-bfc1-08002be10318'
            );
        }).to.throw( Error );
    });

});
});
