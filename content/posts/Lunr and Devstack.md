---
tags:
  - openstack
  - cloud
  - programming
date: 2014-01-22T00:00:00Z
title: Lunr and Devstack
slug: lunr-and-devstack
---
The following instructions are for setting up devstack in a VirtualBox VM. 
1. Create a new VirtualBox VM Instance
2. Ensure you allocate atleast 8GIG of Hardrive space and 1GIG of RAM ( **Anything less than 1GIG or RAM can cause ./stack.sh to fail** also if you plan on running nova instances in addition to running cinder, you will need more )
3. Add a Second Network Adapter to the VM Instance

    **Attached to:** Host-only 
    **Adapter Name:** vboxnet0

***(If vboxnet0 is missing, go to Preferences --> Network and add a Host Only Network interface)***

## Setup Ubuntu and Devstack
1. Add the following to `/etc/network/interfaces` to set up the host based interface on eth1:

        auto eth1
        iface eth1 inet static
        address 192.168.56.2
        netmask 255.255.255.0

2. Install git `sudo apt-get install git`
3. Shutdown the VM and create a **snapshot** ( if ./stack.sh fails, you will be glad you did )
4. Open a terminal and ssh into the VM `ssh username@192.168.56.2`
5. Using the account you want to develop under; clone devstack: `git clone https://github.com/openstack-dev/devstack.git`
6. Create a `devstack/localrc` file with options set for your devstack env:

        ADMIN_PASSWORD=devstack
        MYSQL_PASSWORD=devstack
        RABBIT_PASSWORD=devstack
        SERVICE_PASSWORD=devstack
        SERVICE_TOKEN=devstack
        FLAT_INTERFACE=eth1
        PUBLIC_INTERFACE=eth1
        FLOATING_RANGE=192.168.56.128/28
        HOST_IP=192.168.56.2
        
7.  Run `./stack.sh` and go get some dr. pepper.

## Setting up Lunr
1. Install virtualenv `sudo apt-get install python-virtualenv`
2. Create a virtual env for your user `virtualenv --system-site-packages ~/.virtualenv`
3. Source the virtualenv ( Add the following to your .bashrc if you wish )

        VIRTUAL_ENV_DISABLE_PROMPT=1
        source ~/.virtualenv/bin/activate

4. Git clone `git clone git@github.com:rackspace/lunr.git`
5. Run `python setup.py develop`
6. **Shutdown the VM** and create a second physical disk for lunr-storage to use
7. Setup the LAIO by running `./lunr/bin/lunr-setup-all-in-one`
8. Start lunr services by running `./lunr/bin/lunr-screen` which will start a **screen** session `CTRL-A D` to detach
and leave the services running

## Setting up Cinder to talk to Lunr
Cinder talks with lunr by replacing the standard rpc_backend in cinder with our own lunrrpc which forwards cinder api calls to lunr

1. Edit `/etc/cinder/cinder.conf` and add the following lines:

        rpc_backend = lunr.cinder.lunrrpc
        volume_api_class=lunr.cinder.api.API
        lunr_api_endpoint=http://localhost:8080/v1.0
        lunr_default_volume_type=vtype
        no_snapshot_gb_quota=True
        quota_snapshots=-1

2. Restart Cinder `cd devstack; ./unstack.sh; ./rejoin-stack.sh`

## Setup the Rackspace Cinder Extension
1. `git clone https://github.com/rackerlabs/rackspace_cinder_extensions.git`
2. `cd rackspace_cinder_extensions`
3. `python setup.py install`
4. Edit `/etc/cinder/cinder.conf` and add the following line

        osapi_volume_extension = rackspace_cinder_extensions.snapshot_progress.Snapshot_progress
5. Restart the cinder api

## Configure the storage node to talk to cinder
1. Edit `/etc/lunr/storage-server.conf` and add the following lines under the [cinder] section

        username=admin
        password=devstack
        auth_url=http://localhost:5000
        cinder_url=http://localhost:8776
        rax_auth=False

2. Restart the storage node
