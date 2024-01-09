---
tags:
  - openstack
  - programming
date: 2012-09-07T00:00:00Z
title: DevStack in 12 steps
slug: devstack-in-12-steps
---
These instructions have only been tested on Precise Pangolin

1. Install [Ubuntu Precise Pangolin](http://www.ubuntu.com/download/server)
2. Add a user `adduser stack`
3. Grant sudo privilages `echo "stack ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers`
4. Install git `apt-get update; apt-get install -qqy git`
5. login as user `stack`
5. Get devstack `git clone https://github.com/openstack-dev/devstack.git`
6. `cd devstack`
7. Create a file called `localrc` with the following
        ADMIN_PASSWORD=password
        MYSQL_PASSWORD=password
        RABBIT_PASSWORD=password
        SERVICE_PASSWORD=password
        SERVICE_TOKEN=tokentoken
        FLAT_INTERFACE=eth0
8. Run `./stack.sh`
9. Wait a long time ....
10. `source openrc`
11. Run nova client `nova list`

## Nova Notes ##
1. `nova image-list` lists 3 images, only use `cirros-0.3.0-x86\_64-uec` the others will fail
2. `nova flavor-list` lists flavors, only use flavor 1 or 2, unless you have a ton of memory
3. `./rejoin-stack.sh` will restart nova in a screen session if you had to reboot the machine 
