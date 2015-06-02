var debug = require( 'debug' )( 'coreos:node:exec' );

module.exports = function ( CoreOS ) {


    /**
     * #CoreOS.remote - executes a command on remote party and pipes entire
     * output into console.stdout.
     *
     * Will be used for proxying commands such as: `fleetctl`, `etcdctl`,
     * `systemctl` and so on.
     *
     * @param  {Obejct} node object
     * @return {promise}     promise that will be fulfilled after stream close
     */
    CoreOS.prototype.nodeRemote = function ( node ) {

    }
};
