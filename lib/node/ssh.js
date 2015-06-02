var SSH = require( 'ssh2' );
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
			ssh.connect({
				host: node.host,
				port: node.sshPort,
				username: node.userName,
				privateKey: node.identity.clientKey
			});
		});

		return ssh;
	};

};
