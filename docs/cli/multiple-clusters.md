[<- Back to index](README.md)

# Working with multiple clusters

Create a folder where you will put each cluster config file, I will suppose it
will be `~/coreos/`.

The example case i will provide for this doc will be based on an Continuous
Development scenario.

As so, imagine we want to deploy 3 clusters:
- `production` - will run things into production
- `development` - will run tests, doesn't need same computing power as
`production` does.
- `testing` - will be used for infastructure tests, such as comunication
patterns and so on.

## Configuring our workspace environment

You could use the code chunk above straight on a terminak or just place it on
your shell `rc/profile/init`.

```bash
COREOS_CLUSTERS_PATH=~/coreos/;
mkdir -p ~/coreos/;
coreos_use () { COREOS_CONFIG="~/coreos/$1.json"; }
```

## Launching and working with clusters

```bash
coreos_use testing
coreos bootstrap --numberOfNodes=3;
```

```bash
coreos_use development
coreos bootstrap --numberOfNodes=6;
```

```bash
coreos_use production
coreos bootstrap --numberOfNodes=50;
```
