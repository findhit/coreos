var debug = require( 'debug' )( 'coreos:account:current' );

module.exports = function ( CoreOsManager ) {

    /**
     * @account - required
     *
     * Microsoft Azure current subcription key
     * It must be already configured onto azure-cli
     *
     * {String}
     */
    CoreOsManager.prototype.options.currentaccount = false;


    CoreOsManager.prototype.accountCurrent = function ( current ) {

        current = this.config.currentaccount =
            current ||
            this.options.currentaccount ||
            this.config.currentaccount ||
            undefined;

        if ( ! current ) {
            throw new TypeError( "cannot pickup current account" );
        }

        debug( "picking up current account: %s", current );

        return this.accountGet( current );
    };
};
