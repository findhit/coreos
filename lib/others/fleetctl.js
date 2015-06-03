var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    CoreOS.prototype.fleetctl = function( args ) {

        args =
            Util.is.Array( args ) && args.join( ' ' ) ||
            Util.is.String( args ) && args ||
            false;

        if ( ! args ) {
            throw new TypeError( "invalid args provided" );
        }

        var cos = this;
        var nodes = cos.nodeList();
        var keys = Object.keys( nodes );

        if ( keys.length === 0 ) {
            throw new Error( "cluster has no nodes" );
        }

        var node =
            // Get node in case there is only one
            keys.length === 1 && nodes[ keys[0] ] ||
            // Or filter array randomly until we got only one node and use it
            nodes[ Util.Array.randomFilter( keys, 1 )[ 0 ] ];

        // ssh into node
        var ssh = cos.nodeSSH( node );

        // Since we got everything ready, lets create a promise
        return new Promise(function ( fulfill, reject ) {
            ssh.on( 'error', reject );
            ssh.on( 'ready', function () {
                ssh.forwardOut( 'localhost', 44001, 'localhost', 4001, function( err ) {
                    if ( err ) {
                        return reject( err );
                    }
                    fulfill( ssh );
                });
            });
        })
        .then(function ( ssh ) {
            return new Promise(function ( fulfill, reject ) {
                ssh.exec( '/usr/bin/env fleetctl ' + args, function ( err, stream ){
                    if ( err ) {
                        return reject( err );
                    }

                    fulfill( stream );
                });
            })
            .tap(function ( stream ) {
                stream.on( 'close', function () {
                    ssh.end();
                });
            });
        });
    };

};
