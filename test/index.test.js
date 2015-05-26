var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../' );

describe( "CoreOsAzure", function () {

    it( "should export a constructor", function () {
        expect( typeof CoreOsAzure ).to.be.equal( 'function' );
    });

    it( "should allow creation of CoreOsAzure instance without options", function () {
        return new CoreOsAzure();
    });

});
