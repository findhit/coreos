var chai = require( 'chai' );
var expect = chai.expect;
var CoreOsAzure = require( '../../' );

describe( "node", function () {
describe( "create", function () {

	beforeEach(function () {
		this.cos = new CoreOsAzure();
	});

    it.skip( "should create flawlessly a vm", function () {
        return this.cos.nodeCreate();
    });

});
});
