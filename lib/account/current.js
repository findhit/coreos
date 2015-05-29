var debug = require( 'debug' )( 'coreos:account:current' );

module.exports = function ( CoreOS ) {

    /**
     * @account - required
     *
     * Microsoft Azure current subcription key
     * It must be already configured onto azure-cli
     *
     * {String}
     */
    CoreOS.prototype.options.currentaccount = false;


    CoreOS.prototype.accountCurrent = function ( current ) {

        current =
            current ||
            this.options.currentaccount ||
            this.config.currentaccount ||
            undefined;

        if ( ! current ) {
            throw new TypeError( "cannot pickup current account" );
        }

        current = this.accountGet( current );

        
        debug( "picking up current account: %s", current.id );
        this.config.currentaccount = current.id;

        return current;
    };
};
