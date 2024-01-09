---
date: 2012-10-23T00:00:00Z
tags:
  - cloud
  - openstack
---
First we install the `python cinderclient` module

```
sudo pip install python-cinderclient
```
In order to create a volume using cinder you need a few things from the Rackspace [Cloud Control Panel](https://mycloud.rackspace.com/)

Your username and account number

![[username-account-number.png]]

Your API key

![[api-key.png]]

Look for the 'Region' value on the server detail page

![[server-details.png]]

There are 3 valid regions

* DFW – Dallas
* ORD – Chicago 
* LON – London

Now create a file called `~/cinderrc`

```
export CINDER_RAX_AUTH=1
export OS_AUTH_URL=https://identity.api.rackspacecloud.com/v2.0/
export OS_USERNAME=<Your Username>
export OS_PASSWORD=<Your API Key>
export OS_TENANT_NAME=<Your Account Number>
export OS_REGION_NAME=<DataCenter>
export CINDER_VOLUME_SERVICE_NAME=cloudBlockStorage
```

Source the file into your environment and test your settings by running `cinder`
```
source ~/cinderrc
cinder list
```

If you don’t get an error, it worked! You can now create a new block storage device by issuing something similar to the following

```
cinder create 100 --display-name thrawn01-vol --volume-type ssd
cinder list
```
