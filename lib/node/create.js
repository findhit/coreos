var Util = require( 'findhit-util' ),
    Account = require( '../account/class' ),
    Promise = require( 'bluebird' );


module.exports = function ( CoreOS ) {

    var defaultOptions = {
        image: '2b171e93f07c4903bcad35bda10acf22__CoreOS-Stable-647.0.0',
        size: 'Small',
        sshPort: 22,
        userName: 'core',
        userPassword: false,
        location: 'North Europe',
        persistent: false,
        simulate: false,
    };

    CoreOS.prototype.nodeCreate = function ( options ) {
        var cos = this;
        var node = {};

        return Promise.try(function () {


            // Handle options inherit
            options = Util.extend(
                Object.create( defaultOptions ),
                Util.is.Object( options ) && options || {}
            );

            var account =
                options.account && (
                    typeof options.account === 'string' &&
                        cos.accountGet( options.account ) ||
                    Util.is.instanceof( Account, options.account ) &&
                        options.account
                ) ||
                cos.accountCurrent() ||
                false;

            if ( ! account ) {
                throw new TypeError( "cannot get account we should use" );
            }

            // Generate id for node
            var id = Util.uniqId();

            // Initialzie node object
            node.id = id;
            node.account = account.id;
            node.userName = options.userName;
            node.userPassword = options.userPassword;
            node.location = options.location;
            node.persistent = options.persistent;
            node.sshPort = options.sshPort;

            return options.simulate ?
                node :
                account.nodeCreate( node )
                .then(function () {
                    var nodes = cos.configGet( 'nodes', {} );

                    nodes[ id ] = node;
                });
        });
    };

};
