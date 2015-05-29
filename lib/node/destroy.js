var debug = require( 'debug' )( 'coreos:node:destroy' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.nodeDestroy = function ( id ) {
        var cos = this;

        id = this.nodeGet( id );

        // assuming that we already have it

        var nodes = this.configGet( 'nodes', {} );
        var node = this.nodeGet( id );
        var account = this.accountGet( node.account );

        debug( "destroing node using account nodeDestroy" );

        return account.nodeDestroy( node )
        .then(function () {
            debug( "removing node from nodes object" );
            delete nodes[ node.id ];
        });
    };

};
