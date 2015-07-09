[<- Back to index](README.md)

__WARNING__: Currently deprecated since we have to use `bootstrap` to initialize
a cluster.

# Creating a production-ready cluster

After reviewing some CoreOS architectures we finally edited this to respond to
architecture changes needs.

As so, we added a `role` option to specify if node is part of cluster `services`
providers or just a `worker`.

The example we will provide to you on this guide consists into:
* 4 service nodes (2-per-location)
* 10 worker nodes (5-per-location)

Locations will be:
* North Europe
* West US

If you have many accounts, feel free to spread nodes on them by supplying account
number, id or `random`.

```bash

# WARNING:
# Please be sure that you don't have any nodes configured.
# You can do so by checking `coreos node list`


# building up service nodes
coreos node create \
    --provider="Azure" \
    --numberOfNodes=2 \
    --role="services" \
    --location="North Europe" \
    --size="Medium" \
    --debug # Just because I like to see things happening :)

coreos node create \
    --provider="Azure" \
    --numberOfNodes=2 \
    --role="services" \
    --location="West US" \
    --size="Medium" \
    --debug # Just because I like to see things happening :)

# building workers
coreos node create \
    --provider="Azure" \
    --numberOfNodes=5 \
    --role="worker" \
    --location="North Europe" \
    --size="Small" \
    --debug # Just because I like to see things happening :)

coreos node create \
    --provider="Azure" \
    --numberOfNodes=5 \
    --role="worker" \
    --location="West US" \
    --size="Small" \
    --debug # Just because I like to see things happening :)

# At this moment cluster should be up and running
# Since metadata is automatically built, you could configure units to run
# only on a specified location, on certain kind of nodes, and so on...
# Note: run `coreos fleetctl -- list-machines` for further meta details

# Now you can check up nodes by sshing into them
# coreos node list
# coreos node ssh -n NODEID

```

## Scalling

You can scale cluster by:
* location, by adding or removing `services` nodes on different locations;
* processing power, by adding or removing `worker` nodes on each location;
