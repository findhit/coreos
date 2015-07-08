var SSH = require( 'ssh2' );
var Promise = require( 'bluebird' );
var Util = require( 'findhit-util' );
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

        ssh.promiseExecution = function ( args ) {
            return new Promise(function ( fulfill, reject ) {
                ssh.exec( args, function ( err, stream ) {
                    if ( err ) {
                        return reject( err );
                    }

                    fulfill( stream );
                });
            });
        };

        ssh.promiseSFTP = function () {
            return new Promise(function ( fulfill, reject ) {
                ssh.sftp(function ( err, sftp ) {
                    if ( err ) {
                        return reject( err );
                    }

                    for( var i in sftp.__proto__ ) {
                        if ( typeof sftp.__proto__[ i ] === 'function' ) {
                            sftp[ i + 'Promise' ] = Promise.promisify( sftp.__proto__[ i ].bind( sftp ) );
                        }
                    }

                    fulfill( sftp );
                });
            });
        };

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
