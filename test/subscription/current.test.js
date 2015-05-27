var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsManager = require( '../../' );

describe( "account", function () {
describe( "current", function () {

	beforeEach(function () {
		var cos = this.cos = new CoreOsManager();
        var account = this.account = {
			id: '4d36e96e-e325-11ce-bfc1-08002be10318',
			pem: 'somekindof',
		};

		cos.accountAdd( account );
	});

	it( "should allow us to set current from .accountCurrent", function (){

        this.cos.accountCurrent( this.account.id );

        expect(
            this.cos.accountCurrent()
        ).to.be.equal( this.account );
    });

    it("should allow us to set current from options", function (){
        this.cos.options.currentaccount = this.account.id;

        expect(
            this.cos.accountCurrent()
        ).to.be.equal( this.account );
    });

    it("should allow us to set current from config", function (){
        this.cos.config.currentaccount = this.account.id;

        expect(
            this.cos.accountCurrent()
        ).to.be.equal( this.account );
    });

});
});
