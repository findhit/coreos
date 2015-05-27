var Class = require( 'findhit-class' );

var CoreOsManager = Class.extend({

    statics: {
        commands: {},
    },

    options: {},

    initialize: function ( options ) {
        options = this.setOptions( options );
    },

});

// Export it
module.exports = CoreOsManager;

// Extend with libs

    require( './init' )( CoreOsManager );
    require( './config' )( CoreOsManager );
    require( './discovery' )( CoreOsManager );

    // account
    require( './account/list' )( CoreOsManager );
    require( './account/add' )( CoreOsManager );
    require( './account/get' )( CoreOsManager );
    require( './account/current' )( CoreOsManager );
    require( './account/remove' )( CoreOsManager );

    // nodes
    require( './node/list' )( CoreOsManager );
    require( './node/create' )( CoreOsManager );
    require( './node/get' )( CoreOsManager );
    require( './node/ssh' )( CoreOsManager );
    require( './node/destroy' )( CoreOsManager );

    // certificate
    require( './certificate/list' )( CoreOsManager );
    require( './certificate/create' )( CoreOsManager );
    require( './certificate/destroy' )( CoreOsManager );

    // deploy
    require( './deploy/service' )( CoreOsManager );
    require( './deploy/docker' )( CoreOsManager );
