var Class = require( 'findhit-class' );

var CoreOS = Class.extend({

    options: {},

    initialize: function ( options ) {
        options = this.setOptions( options );
    },

});

// Export it
module.exports = CoreOS;

// Extend with libs

    require( './config' )( CoreOS );
    require( './discovery' )( CoreOS );

    // account
    require( './account/list' )( CoreOS );
    require( './account/add' )( CoreOS );
    require( './account/get' )( CoreOS );
    require( './account/current' )( CoreOS );
    require( './account/remove' )( CoreOS );

        // Bind account class
        CoreOS.Account = require( './account/class' );


    // nodes
    require( './node/list' )( CoreOS );
    require( './node/create' )( CoreOS );
    require( './node/get' )( CoreOS );
    require( './node/ssh' )( CoreOS );
    require( './node/destroy' )( CoreOS );

    // deploy
    require( './deploy/service' )( CoreOS );
    require( './deploy/docker' )( CoreOS );

    // others
    require( './others/kill' )( CoreOS );
