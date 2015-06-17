var Util = require( 'findhit-util' );
var Promise = require( 'bluebird' );

module.exports = function ( CoreOS ) {

    var defaultOptions = {
        numberOfNodes: 3,
        account: undefined, // if not specified, nodes will be spreaded out
        size: 'Small',
        location: 'North Europe',
        group: 'stable',
    };

    CoreOS.prototype.bootstrap = function( options ) {
        var cos = this;

        return Promise.try(function () {
            var nodesOptions = [];

            // Handle options inherit
            options = Util.extend(
                {}, defaultOptions,
                Util.is.Object( options ) && options || {}
            );

            var nodes = cos.nodeList();
            var nodesIds = Object.keys( nodes );

            if ( nodesIds.length !== 0 ) {
                throw new Error( "cluster already bootstraped, please kill it before running bootstap" );
            }

            if ( Object.keys( cos.accountList() ).length === 0 ) {
                throw new Error( "we need accounts to get started, please join them" );
            }

            for( var i = 0; i < options.numberOfNodes; i++ ) {
                if ( options.account ) {
                    nodesOptions.push({
                        account: options.account,
                    });
                } else {
                    nodesOptions.push({
                        // iterate on accounts for each node
                        account: cos.accountGet( i ),
                        role: 'services',
                        size: options.size,
                        location: options.location,
                        group: options.group,
                        persistent: true,
                    });
                }
            }

            return nodesOptions;
        })
        .each(function ( nodeOptions ) {
            return cos.nodeCreate( nodeOptions );
        });
    };

};
