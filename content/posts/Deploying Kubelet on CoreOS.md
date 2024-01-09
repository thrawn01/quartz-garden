---
tags:
  - coreos
  - kubernetes
  - containers
date: 2015-12-04T16:38:58Z
---
### Deploying Kubelet on CoreOS in a consistent and maintainable manner

If you are running the CoreOS beta channel, you should already have kubelet
installed, but if you are running stable channel like me and wish to play
with the latest and greatest kubernetes and deploy a non trivial sized cluster,
read on.
<!--more-->

## How to fail at running Kubelet in a container

The right way deploy Kubelet on a large cluster of machines is to deploy
kube-proxy and kubelet on all of your workers using containers, but as of this
writing I could not achieve running Kubelet inside a container. The kubernetes
source tree has an example of running Kubelet inside a container in the ```local-up-cluster.sh``` file.  However I was not able to achieve running kubelet on CoreOS using the example given. There is definitely work being done
to get kubelet to run in containers but does not appear to be complete at this
time. [See Here](https://github.com/kubernetes/kubernetes/pull/6936)

The first hurdle I attempted to overcome was getting the Kubelet container to
run in the same pid namespace as the host. When kubelet runs it attempts to
move processes like docker daemon into separate name spaces, If it’s running
inside a container it will complain it can't find these processes, and rightly
so, because the container is running within it’s own pid namespace. So, we need
a way to run a container inside the host namespace.

Unfortunately Docker 1.7.1 does not support running containers in the pid
namespace of the host, in what might be termed as a [super privileged container](http://developerblog.redhat.com/2014/11/06/introducing-a-super-privileged-container-concept/).
But Spawnd does allow running containers in the host pid namespace! So inspired
by [toolbox](https://github.com/coreos/toolbox/blob/master/toolbox) I wrote a script
that would download the docker image, export the container, untar the container
somewhere on CoreOS and then run the Kubelet within the super privileged
container.

This didn't work for several reasons; First; spawnd mounts ```/proc/sys``` as
read only (Which I overcame with a simple remount script that runs before
Kubelet), Second there were some kubelet mount issues which I never figured out
(Even with using --containerized), Third; and here is the big one... now that
kubelet was running in the host namespace it could see all the processes
running on the host but it was still unable to move processes into different
names spaces. I'm not sure if this is a kernel security limitation, or
something in the way spawnd setup the container.  In the end I decided to move
on and just use docker as a software delivery platform to install the kubelet
binaries, config files and necessary TLS certificates.

## How to install Software on CoreOS via Docker containers

What I'm going to show you now is how you can use containers and systemd to deploy a
kubernetes worker on CoreOS in a reproducible and maintainable manner

At first you might think all you need is to use ```cloud-config``` until you
realize it can do everything; but install binaries. Well technically it can,
but you have to base encode the binary and place it in the cloud-config.yaml
file which is not something I want to do with a 55 Megabyte binary. The second
thought I had was too run the [cloud-config as a script](https://github.com/coreos/coreos-cloudinit#executing-a-script) and have
the script download the binary from some http site I would have to setup. I
really don’t want to manage an out of band http server with Kubelet and SSL
certs rolled up in a tar ball. So I decided to create a docker image that would
preform the installation for me! So now all the software I want to run on the
cluster and the software to install kubelet on CoreOS all live in my
local docker repo!

For my kubernetes setup I created 2 docker images, one for the kubernetes
master and one for the workers. To make installation simple I have systemd run
the install image at startup which insures my workers always have the latest
and greatest installed.

First lets start with the Dockerfile where we create our image
```
FROM gcr.io/google_containers/hyperkube:v1.1.1

# Copy everything in our worker root to the image
COPY root /worker-root

# Copy the worker installation script
COPY worker-install.sh /
RUN chmod +x /worker-install.sh
```
All of the TLS Certs, config files and binaries are located in the relative ```./root``` tree structure and is copied to ```/worker-root``` inside the
Docker image. We use the hyperkube image because it contains everything we will
need to preform the installation including ```nsenter```

The ```./root``` directory structure looks like this
```
$ find root
root
root/etc
root/etc/flannel
root/etc/flannel/options.env
root/etc/kubernetes
root/etc/kubernetes/ssl
root/etc/kubernetes/ssl/apiserver-key.pem
root/etc/kubernetes/ssl/apiserver.csr
root/etc/kubernetes/ssl/apiserver.pem
root/etc/kubernetes/ssl/ca.pem
root/etc/kubernetes/ssl/worker-key.pem
root/etc/kubernetes/ssl/worker.csr
root/etc/kubernetes/ssl/worker.pem
root/etc/kubernetes/worker-kubeconfig.yaml
— SNIP ---
```
Now lets look at ```worker-install.sh```

```
#!/bin/bash
set -e

WORKER_ROOT=/worker-root
COREOS_ROOT=/rootfs

NSENTER="./nsenter --mount=${COREOS_ROOT}/proc/1/ns/mnt -- "
SYSTEM_CTRL="$NSENTER /usr/bin/systemctl"

function render_template () {
    eval "echo \"$(cat $1)\""
}

function get_ip () {
    echo $($NSENTER ifconfig $1 | awk '/inet /{print $2}')
}

# These variables are used when render_template is called
PUBLIC_IP=$(get_ip eth0)
SERVICE_IP=$(get_ip eth1)

# Install /etc
cp -r $WORKER_ROOT/* $COREOS_ROOT

# Expand the variables in some of our files
render_template $WORKER_ROOT/etc/flannel/options.env > $COREOS_ROOT/etc/flannel/options.env
render_template $WORKER_ROOT/etc/systemd/system/kubelet.service > $COREOS_ROOT/etc/systemd/system/kubelet.service
render_template $WORKER_ROOT/etc/systemd/system/kube-proxy.service > $COREOS_ROOT/etc/systemd/system/kube-proxy.service

# Tell systemd it has new unit files
$SYSTEM_CTRL daemon-reload

# Enable to services to start at boot
$SYSTEM_CTRL enable worker-install
$SYSTEM_CTRL enable kubelet
$SYSTEM_CTRL enable kube-proxy

# Start the services
$SYSTEM_CTRL start kubelet
$SYSTEM_CTRL start kube-proxy
```

Starting from the top we define a helper function called $NSENTER that will
allow us to execute commands in the host name space from the container. [See https://github.com/jpetazzo/nsenter](https://github.com/jpetazzo/nsenter)

Next we create a function called ```render_template()``` which preforms a little
bash magic and gives us a poor mans template renderer. This will take a
single file as input and expand any bash variables it finds within the target
file. I mostly use this for expanding ```$PUBLIC_IP``` inside ```kubelet.service```
 and ```kube-proxy.service```.

Next we figure out what public ip we have been assigned by our cloud provider
or physical machine. Finally we recursively copy all the binaries, TLS Certs,
config files, and systemd unit files from ```/worker-root``` into the host root
file system we have mounted on ```/rootfs```.  Once these files are on disk we
tell systemd to reload and start the appropriate services.

Now lets create our image and upload it to our docker repo
```
$ export DOCKER_REPO=<your-repo-here>
$ docker build -t ${DOCKER_REPO}/worker:latest .
$ docker push ${DOCKER_REPO}/worker:latest
```

All that is left is to have systemd pull and run the docker container on server startup by creating ```/etc/systemd/system/worker-install.service```
```
[Unit]
Description=This downloads the docker image and runs the installation \
script from within a docker container

[Service]
Type=oneshot
ExecStart=/usr/bin/docker pull <your-docker-repo>/worker:latest
ExecStart=/usr/bin/docker run --privileged --net=host --ipc=host --uts=host -v /:/rootfs -v /dev:/dev -v /run:/run <your-docker-repo>/worker:latest /worker-install.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```
This one shot systemd service unit preforms a ```docker pull``` to ensure it
has the latest version of the image then runs the install script from within
the docker image. I give the container access to all the namespaces docker can
provide just incase one day my script may need it.

In order to avoid any chicken and egg problems both ```kube-proxy``` and ```kubelet```
Unit files depend upon ```worker-install.servce``` before they
are allowed to start, You can set this up by adding the following to any
dependent systemd units.

```
[Unit]
Requires=worker-install.service
Before=worker-install.service
```

Now you can place the ```worker-install.service``` into a ```cloud-config``` and
have it create the service when your provider installs CoreOS on the server.
Once the server is booted, the rest of the kubernetes worker software should
install automatically.

## Final Thoughts

At first glance this seams like a bit of a hack, but the more I ponder
containers role in an infrastructure ecosystem if becomes clear that containers
are not only a great software delivery method but also within the realm of
system configuration.

In a nutshell, anything you want to do to a Server; firmware updates, hardware
configuration, and software installation should all be performed or installed
by a container.

You could conceivably run salt or ansible from a container without ever having
to install python on the operating system, making updates to those systems a
snap, just update the salt image and restart a systemd service on the server and
bingo, you are running the latest version of salt/ansible/kubernetes. 

Also, I think super privileged containers are a great idea. At Rackspace Cloud Block Storage 
we have tons of servers that we can not restart on a whim, but do occasionally
need security upgrades. Because CoreOS requires a reboot to update, CoreOS is
not optimal for those kinds of servers. However if CoreOS ran sshd from a
container that could be upgraded independently of the operating system no
reboot would be required!  The more Software running in containers the better!
In the future I would love to see CoreOS ship their sshd server in this manner.

On second thought, Don't even ship CoreOS with sshd, let the users pick what servers to run.

