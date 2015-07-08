var Util = require( 'findhit-util' ),
	debug = require( 'debug' )( 'coreos:node:get' );

module.exports = function ( CoreOS ) {

	CoreOS.prototype.nodeGet = function ( id ) {
		var nodes = this.configGet( 'nodes', {} );
        var nodesIds = Object.keys( nodes );


		var node =
			id === 'random' && nodes[ nodesIds[ Math.floor( Math.random() * nodesIds.length ) ] ] ||
			typeof id === 'number' && nodes[ nodesIds[ id % nodesIds.length ] ] ||
			Util.is.Object( id ) && id.id && nodes[ id.id ] ||
			// id instanceof Node && id ||
			nodes[ id ] ||
			false;

		// check for id
		if ( ! node ) {
			throw new TypeError( "node isnt valid" );
		}

		debug( 'getting node %s', node.id );

		return node;
	};

};
