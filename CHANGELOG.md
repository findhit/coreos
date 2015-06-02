## Upcoming
- Added support for multiple nodes creation on CLI
- Add API `.kill` and `coreos kill --i-am=sure` methods for easy testing
- In case `discovery` is being generated while there are `nodes` on config, an
error is thrown to avoid cluster division.


## 0.1.0
- node now has an independent ssh certificate;
- CLI actions for: account, configs, node and services management;
- Added `.nodeSSH` method
- CLI action added for ssh into node: `coreos node ssh --node="id"`


## 0.0.1
npm name allocation
