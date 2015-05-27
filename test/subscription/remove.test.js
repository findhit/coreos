var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsManager = require( '../../' );

describe( "account", function () {
describe( "list", function () {

	beforeEach(function () {
		this.cos = new CoreOsManager();
	});

	it( "should get accounts from config", function () {
        var self = this;
		var accounts = this.cos.configGet( 'accounts', {} );
		var account = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

        // Add manually
        accounts[ account.id ] = account;

        expect(function () {
            self.cos.accountRemove(
                account.id
            );
        }).to.not.throw( Error );

        expect( accounts[ account.id ] ).to.be.equal( undefined );
    });

    it( "should throw an error if no id is provided", function () {
        var self = this;
        expect(function () {
            return self.cos.accountRemove();
        }).to.throw( TypeError );
    });

    it( "should throw an error if id isnt a valid uuid", function () {
        expect(function () {
            return this.cos.accountRemove(
                '4d36e96'
            );
        }).to.throw( TypeError );
    });

});
});
