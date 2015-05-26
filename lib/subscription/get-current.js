var debug = require( 'debug' )( 'coreos-azure:subscription:get-current' );

module.exports = function ( CoreOsAzure ) {
    CoreOsAzure.prototype.subscriptionGetCurrent = function ( current ) {

        current =
            this.options.subscription ||
            this.config.subscription ||
            undefined;

        if ( ! current ) {
            throw new TypeError( "cannot pickup current subscription" );
        }

        debug( "picking up current subscription: %s", current );

        return this.subscriptionGet( current );
    };
};
