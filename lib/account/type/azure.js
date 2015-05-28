var Account = require( '../class' );

var images = {
    stable: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.2.0',
    beta: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Beta-681.0.0',
    alpha: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Alpha-681.0.0',
};

function validUUID ( uuid ){
    if( ! uuid || typeof uuid != 'string' ){
        return false;
    }

    return new RegExp( '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' )
    .test( uuid );
}

var Azure = Account.extend({

    validSubscription: function ( subscription ) {

        subscription =
            subscription ||
            this.options.subscription;

        return validUUID( subscription );
    },

    createNode: function ( node ) {
        // TODO
    },

    destroyNode: function ( node ) {
        // TODO
    },

});

// Export Azure
module.exports = Azure;
