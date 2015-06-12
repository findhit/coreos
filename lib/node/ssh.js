var SSH = require( 'ssh2' );
var Promise = require( 'bluebird' );
var debug = require( 'debug' )( 'coreos:node:ssh' );

module.exports = function ( CoreOS ) {


    /**
     * #CoreOS.nodeSSH - initializes an SSH connection
     *
     * @param  {mixed}     node  id, or node object
     * @return {SSHClient}       ssh stream
     */
    CoreOS.prototype.nodeSSH = function ( node ) {

		debug( "gethering node data" );
		node = this.nodeGet( node );

		debug( "constructing ssh client" );
		var ssh = new SSH.Client();

		setImmediate(function () {
            debug( "connecting to host" );
			ssh.connect({
				host: node.host,
				port: node.sshPort,
				username: node.userName,
				privateKey: node.identity.clientKey,
			});
		});

		return ssh;
	};

    CoreOS.prototype.nodeSSHReady = function ( node ) {
        var ssh = this.nodeSSH( node );

        return new Promise(function ( fulfill, reject ) {
            debug( "proxying events flow logic into a promise" );

            ssh.on( 'error', function ( err ) {
                debug( "ssh connection failed, still better than Justen Bieber" );
                reject( err );
            });
            ssh.on( 'ready', function () {
                debug( "ssh connection was a huge success" );
                fulfill( ssh );
            });
        });
    };

};
