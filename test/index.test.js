var chai = require( 'chai' );
var expect = chai.expect;
var CoreOS = require( '../' );

describe( "CoreOS", function () {

    it( "should export a constructor", function () {
        expect( typeof CoreOS ).to.be.equal( 'function' );
    });

    it( "should allow creation of CoreOS instance without options", function () {
        return new CoreOS();
    });

});
