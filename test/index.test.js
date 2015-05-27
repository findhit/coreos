var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsManager = require( '../' );

describe( "CoreOsManager", function () {

    it( "should export a constructor", function () {
        expect( typeof CoreOsManager ).to.be.equal( 'function' );
    });

    it( "should allow creation of CoreOsManager instance without options", function () {
        return new CoreOsManager();
    });

});
