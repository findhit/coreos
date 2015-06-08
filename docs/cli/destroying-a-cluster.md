[<- Back to index](README.md)

# Destroying a cluster

In case you have provisioned some nodes into a new cluster and you want to
destroy all of them to start over, we have a command for that!

`coreos kill` command handles the hard job of deleting existing nodes and
configured accounts on-the-fly.

```bash

# Change dir where your config is
cd ~;

# Now lets kill the cluster
# since this is a sensitive command, we've added the option `--i-am=sure` just
# to avoid mistakes
coreos kill --i-am=sure;

```

### But what if i dont want to keep my provider accounts and really start over?

```bash

# Change dir where your config is
cd ~;

# Kill current cluster
coreos kill --i-am=sure;

# Destroy config file
# We advise you to backup it before destroying
rm -f ~/.coreos.json;

# Now you will have to add new accounts

```
