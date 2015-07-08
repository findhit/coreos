var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );
var fs = require( 'fs' );
var path = require( 'path' );
var debug = require( 'debug' )( 'coreos:node:exec' );

var ArgsSplitter = /(\"[^\"]*\"|\'[^\']*\'|[^\ ]*)/g;

module.exports = function ( CoreOS ) {


    /**
     * #CoreOS.nodeExec - executes a command on remote party and returns
     * stream for piping.
     *
     * Will be used for proxying commands such as: `fleetctl`, `etcdctl`,
     * `systemctl` and so on.
     *
     * @param  {Obejct} node object
     * @return {promise}     promise that will be fulfilled after stream close
     */
    CoreOS.prototype.nodeExec = function ( node, args, options ) {

        debug( "nodeExec called" );

        // handle args
        args =
            Util.is.Array( args ) && args
                .map(function ( arg ) {
                    return '"' + arg + '"';
                })
                .join( ' ' ) ||
            Util.is.String( args ) && args ||
            false;

        if ( ! args ) {
            throw new TypeError( "invalid args provided" );
        }

        // handle options
        options = Util.is.Object( options ) && options || {};
        options.__proto__ = CoreOS.prototype.nodeExec.defaultOptions;

        debug( "trying to execute '%s'", args );

        // Prepare an array to place found path stats and other information such
        // as remote path
        var stats = [];
        var remotePath = '/tmp/' + Util.uuid();

        debug( "resplitting args" );

        // redivide args again
        args = args.match( ArgsSplitter )
            .map(function ( arg ) {
                return arg
                    .replace( /^"/, '' )
                    .replace( /"$/, '' );
            })
            .map(function ( arg ) {
                return arg.trim();
            })
            .filter(function ( arg ) {
                return arg;
            })

            // check if we should upload files
            .map(function ( filePath ) {

                // Dont try to do nothing if we cant grab
                if ( ! options.uploadFilesOnArgs ) {
                    return filePath;
                }

                if ( ! filePath.match( /^:/ ) ) {
                    return filePath;
                }

                // Seem s that file path is starting with `:`, lets remove it
                filePath = filePath.replace( /^:/, '' );


                // check if it is a valid path
                var stat;

                try {
                    stat = fs.lstatSync( filePath );
                } catch ( err ) {
                    return filePath;
                }

                debug( "found a file" );

                if ( stat.isFile() && options.uploadFilesOnArgs ) {
                    stat.path = filePath;
                    stat.uuid = Util.uuid();
                    stat.remotePath = remotePath + '/' + stat.uuid + '/' + path.basename( filePath );

                    debug( "path will be '%s'", stat.remotePath );

                    stats.push( stat );

                    return stat.remotePath;
                }

                return filePath;

            })

            .map(function ( arg ) {
                return arg.replace( ' ', '\\ ' );
            })
            .join( ' ' );

        debug( "handled args '%s'", args );

        return this.nodeSSHReady( node )

        // upload files if there are any
        .tap(function ( ssh ) {
            debug( "temporary upload process" );

            // Ignore if files array is empty
            if( stats.length === 0 ) {
                debug( "no stats queued, returning" );
                return;
            }

            debug( "starting sftp connection" );

            // First, make sure that path is already available by running make
            return ssh.promiseSFTP()
            .tap(function ( rfs ) {
                debug( "creating dir '%s'", remotePath );
                return rfs.mkdirPromise( remotePath );
            })
            .tap(function ( rfs ) {
                return Promise.all( stats )
                .each(function ( stat ) {
                    // create folders for each stat
                    var dirname = path.dirname( stat.remotePath );
                    debug( "creating dir '%s'", dirname );

                    return rfs.mkdirPromise( dirname );
                })
                .map(function ( stat ) {
                    debug( "preparing streams" );

                    var localStream = fs.createReadStream( stat.path );
                    var remoteStream = rfs.createWriteStream( stat.remotePath );

                    // Pipe localstream to remotestream
                    localStream.pipe( remoteStream );

                    return Promise.all([
                        new Promise(function ( fulfill, reject ) {
                            localStream.on( 'error', reject );
                            localStream.on( 'end', fulfill );
                        }),
                        new Promise(function ( fulfill, reject ) {
                            remoteStream.on( 'error', reject );
                            remoteStream.on( 'finish', fulfill );
                        }),
                    ])
                    .tap(function () {
                        debug( "file '%s' uploaded to '%s'", stat.path, stat.remotePath );
                    });
                });
            });
        })

        // Execute args on node
        .then(function ( ssh ) {
            return ssh.promiseExecution( args )
            .tap(function ( stream ) {
                stream.on( 'close', function () {
                    if ( stats.length ) {
                        ssh.promiseExecution( 'rm -fR ' + remotePath )
                        .finally(function () {
                            ssh.end();
                        });
                    } else {
                        ssh.end();
                    }
                });
            })
            .then(function ( stream ) {
                return [ ssh, stream ];
            });
        });
    };

    CoreOS.prototype.nodeExec.defaultOptions = {
        uploadFilesOnArgs: true,
        // stats: undefined,
    };
};
