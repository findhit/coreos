module.exports = function ( CoreOS ) {

    CoreOS.prototype.nodeDestroy = function ( node ) {
        var cos = this;

        node = this.nodeGet( node );

        // assuming that we already have it

        var nodes = this.configGet( 'nodes', {} );

        delete nodes[ node.id ];

        return this;
    };

};
