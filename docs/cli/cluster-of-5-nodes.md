[<- Back to index](README.md)

# Creating a cluster of 5 nodes with cli

```bash

# Change dir where your config is
cd ~;

# Add your account
# coreos account add ...

# Create 5 nodes
# discover url, communication and other stuff will be handled under the hood
coreos bootstrap --numberOfNodes=5;

```

### You're kidding right? You only need to run that?

No, i'm not kidding, and YES its easy!

### And what if i have more than one account?

You have an option on `bootstrap` method to supply an account for provisioning
nodes, but by default it will try to use all your accounts instead.

This is useful if you are on *Azure Bizspark* program or something similar,
since their spread offered credits into 5 accounts.
