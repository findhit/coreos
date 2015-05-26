var debug = require( 'debug' )( 'coreos-azure:subscription:current' );

module.exports = function ( CoreOsAzure ) {

    /**
     * @subscription - required
     *
     * Microsoft Azure current subcription key
     * It must be already configured onto azure-cli
     *
     * {String}
     */
    CoreOsAzure.prototype.options.currentSubscription = false;


    CoreOsAzure.prototype.subscriptionCurrent = function ( current ) {

        current = this.config.currentSubscription =
            current ||
            this.options.currentSubscription ||
            this.config.currentSubscription ||
            undefined;

        if ( ! current ) {
            throw new TypeError( "cannot pickup current subscription" );
        }

        debug( "picking up current subscription: %s", current );

        return this.subscriptionGet( current );
    };
};
