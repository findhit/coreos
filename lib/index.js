var Class = require( 'findhit-class' );

var CoreOS = Class.extend({

    statics: {
        commands: {},
    },

    options: {},

    initialize: function ( options ) {
        options = this.setOptions( options );
    },

});

// Export it
module.exports = CoreOS;

// Extend with libs

    require( './init' )( CoreOS );
    require( './config' )( CoreOS );
    require( './discovery' )( CoreOS );

    // account
    require( './account/list' )( CoreOS );
    require( './account/add' )( CoreOS );
    require( './account/get' )( CoreOS );
    require( './account/current' )( CoreOS );
    require( './account/remove' )( CoreOS );

    // nodes
    require( './node/list' )( CoreOS );
    require( './node/create' )( CoreOS );
    require( './node/get' )( CoreOS );
    require( './node/ssh' )( CoreOS );
    require( './node/destroy' )( CoreOS );

    // certificate
    require( './certificate/list' )( CoreOS );
    require( './certificate/create' )( CoreOS );
    require( './certificate/destroy' )( CoreOS );

    // deploy
    require( './deploy/service' )( CoreOS );
    require( './deploy/docker' )( CoreOS );
