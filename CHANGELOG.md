## Upcoming
- Fixed a bug on Azure `format-ephemeral.service` where it was running before
`mnt-resource.mount`.
- `coreos node list` is now more verbose about each node.
- `coreos [etcdctl|fleetctl]` is using only `role=services` nodes.
- Using discovery again but without the hassle that we had before.
- `coreos kill` enhanced by starting node's destruction at the same time
- `coreos bootstrap` enhanced by pooling different node creations per account
- Added `host` key to `coreos node list`
- Cloudconfig changed to make `docker.service` wait for `flanneld.service`
- `coreos node exec` has now a better arguments parser.
- `services` role is now called `boss`
- Added a command which keeps your cluster working and secure - `coreos doctor`
- Added a firewall rules management per node to close a security issue to avoid
connections to etcd server from the outside world.
- Using a pre release of flannel instead because of NAT support.

## 0.1.3
- Fix ephemeral disk detection, formatting and mounting
- Added logic for execute remote commands with detection and uploading of local
files to remote server before executing command. Detection is made by appending
`:` before a local path.
- Added same features present on `accountGet`, such as `random` get, on `nodeGet`

## 0.1.2
- discarded discovery from the equation, this now handles cluster initialize
- added `.bootstap` for initialize a cluster on multiple accounts
- using `group` instead of `image` for selecting release group channel
- we are now using `etcd2` instead of `etcd`
- after each `.create` we now wait until node is up by default for a better flow
control when creating lots of nodes
- added `coreos etcdctl -- args` compability
- some changes on `docs/` adding bootstrap as default method for creating a
cluster
- added `role` options so we can specify different kind of coreos cluster
architectures
- added new accountGet features such as random or iterative pick
- fixed problems related to update channel group settings
- enriched metadata content for better future cluster node filtering
- added a doc which specifies how to create a scalable and production ready
cluster cross locations

## 0.1.1
- Added `coreos fleetctl -- args` compability
- Added docs and changed `examples/` folder to `docs/`
- Added support for multiple nodes creation on CLI
- Add API `.kill` and `coreos kill --i-am=sure` methods for easy testing
- In case `discovery` is being generated while there are `nodes` on config, an
error is thrown to avoid cluster division.
- All ids are now uuid32 instead of `Util.uniqId`

## 0.1.0
- node now has an independent ssh certificate;
- CLI actions for: account, configs, node and services management;
- Added `.nodeSSH` method
- CLI action added for ssh into node: `coreos node ssh --node="id"`

## 0.0.1
npm name allocation
