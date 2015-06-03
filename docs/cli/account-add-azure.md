[<- Back to index](README.md)

# Adding an Azure account

Well, there are a lot of ways of doing this but I will only explain the easiest.

```bash

# Change to your home dir
cd ~;

# install coreos and azure cli globally
# We do not use Azure npm xplat cli for talking with azure, so this is only
# needed to export easily your subscriptions as `.pem` files
npm install --global coreos azure;

# Download your subscription xml
azure account download;

# Import it into azure
azure account import /path/to/your/subscription/downloaded.xml;

# Now we have to export it as a pem cert
# this will create a `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pem`
azure account cert export;

# at this moment, if you do not need azure cli, you could remove it
npm remove --global azure;

# import your pem into coreos account
coreos account add \
    --provider=Azure \
    --azure-subscription=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
    --azure-pem-path=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pem;

# At this moment you could delete `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pem`
# file, unless you plan to add it into another cluster configuration.
rm xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.pem;

# Set this account as default for next coreos commands
coreos account setCurrent --account=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Now you're ready to go!! :)

# Create your first cluster!!
coreos node create --location="North Europe";
coreos node ssh --node=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;

```
