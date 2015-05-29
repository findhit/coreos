var CoreOS = require( './' );
var fs = require( 'fs' );
var Promise = require( 'bluebird' );

// ------


var cos = new CoreOS();

var account = new CoreOS.Account.Provider.Azure({
    subscription: '1cce3c52-effb-44bf-9b52-276c7b39ea1c',
    pem: fs.readFileSync( __dirname + '/test/resources/1cce3c52-effb-44bf-9b52-276c7b39ea1c.pem', 'utf-8' )
}, cos );

// save account on config
account.save();

// use this account as current
cos.accountCurrent( account );

// Create a node!!! :DDDDD

Promise.cast()

.then(function () {
    return cos.nodeCreate({
        userName: 'core',
        userPassword: 'TestingThis123'
    });
})

.then(function () {
    cos.configSave();
});
