var chai = require( 'chai' );
var fs = require( 'fs' );
var expect = chai.expect;
var CoreOsManager = require( '../../' );

describe( "node", function () {
describe.only( "create", function () {

	beforeEach(function () {
		this.cos = new CoreOsManager();

		this.cos.accountAdd({
			id: '1cce3c52-effb-44bf-9b52-276c7b39ea1c',
			pem: fs.readFileSync( __dirname + '/../resources/1cce3c52-effb-44bf-9b52-276c7b39ea1c.pem', 'utf-8' ) + '',
		});

		this.cos.accountCurrent( '1cce3c52-effb-44bf-9b52-276c7b39ea1c' );
	});

    it( "should create flawlessly a vm", function () {
        return this.cos.nodeCreate();
    });

});
});
