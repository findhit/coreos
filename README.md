# coreos

the missing CoreOS cli for creating and managing clusters on different providers

##### Warning:

Currently we only support Microsoft Azure Cloud. Feel free to PR your own
account provider class.



## Cli

### Installation

```bash
npm install --global coreos
```


### Usage

Please check `--help` with cli for further details.

```bash
coreos --help
```

##### Examples:

```bash
# Change to home dir so we can save config on "~/.coreos.json"
cd ~;

# Add an Azure Account
coreos account add \
    --provider="Azure" \
    --subscription="xxxx-xxxxx-xxxxxxx...." \
    --pem="/your/path/to/cer.pem";

# Say to CoreOS instance that we will use this on next commands
coreos account setCurrent \
    --account="{account-id}"

# Now, lets say that we want to add an azure-based node into our cluster
coreos node create \
    --location="West US"

# Its easy right? If you think so, star this project!
```



## Node.js / io.js

### Installation

```bash
npm install --save coreos
```

### Usage


Please check [API](API.md) for further methods details.

##### Examples:

```javascript
var CoreOS = require( 'coreos' );
var cos = new CoreOS({
        // Don't read configuration file
        loadConfigOnInit: false,
    });

// Add an Azure Account
var azure = new CoreOS.Account.Provider.Azure(
        {
            subscription: 'xxxx-xxxxx-xxxxxxx....',
            pem: fs.readFileSync( '/your/path/to/cer.pem' );
        },

        // Notice that we are passing current CoreOS instance
        cos
    );

// Say to CoreOS instance that we will use this
// on next commands
azure.setAsCurrent();


// Now, lets say that we want to add an azure-based node
// into our cluster

cos.nodeCreate({
    location: 'West US',
})

// As it returns a promise (hell yeah!!), we can then
// do something with node's info
.then(function ( node ) {
    console.log( node );
});


// Its easy right? If you think so, star this project!
```


## Motivation

findhit entered Microsoft BizSpark program recently and we ended up choosing
CoreOS as our cloud cluster OS. We did a bunch of internal bash scripts for
handling cluster scaling and its resources but it ended up too hard to maintain.

As CTO, I've decided to create a cli manager as our scaling endpoint.


## Contributing

Feel free to contribute by creating Issues or Pull Requests.
