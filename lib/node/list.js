var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:node:list' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.nodeList = function () {

		debug( "Returning all nodes" );
		var nodes = this.configGet( 'nodes', {} );

		return nodes;
	};


};
