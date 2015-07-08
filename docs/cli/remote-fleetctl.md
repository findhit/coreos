# Remote controlling fleetctl

```bash

# coreos fleetctl -- [fleetctl args]

coreos fleetctl -- list-machines
coreos fleetctl -- submit :/my/local/path/unit.file

```

`coreos fleetctl` uses `coreos node exec`, which allows remote execution with
local files uploading by appending `:`, thats awesome for submiting your units
files to the cluster.


That means the submit command equals to:
```bash
coreos node exec -- fleetctl submit :/my/local/path/unit.file
```
