---
date: 2015-11-30T00:00:00Z
title: Core OS kubernetes tutorial encourages bad behavior
tags:
  - kubernetes
  - cloud
---
I've been working on building and installing Kubernetes from scratch and during
this process I followed a guide on the CoreOS website called [CoreOS + Kubernetes Step By Step](https://coreos.com/kubernetes/docs/latest/getting-started.html).
In this guide they demonstrate using cloud-config to install SSL Certs on the
core OS operating system. Altho this makes the guide simpler; by doing this I
have found it encourages bad behavior. This is because when you trying to scale
the solution one immediately starts reaching for a configuration management
systems to handle installing a SSL Certs and binaries onto CoreOS
workers/masters. This is not what you want!
<!--more-->

One perk of running a fleet of immutable operating systems is to leave
configuration management behind and have an simple and tiny unmodified
operating system that runs containers that contain either static configuration
fetch remotely managed configuration via something like etcd.

So going forward I modified cloud-config to install systemd services that run
Kubernetes services inside docker containers using images I created that have
the proper SSL certificates installed in the image. This solution scales better
and without the need of configuration management system. In the future I
conceive of using something like confd and etcd to distribute the SSL Certs to
the proper containers. 

On a related note, if you see the errors below when running kibe-proxy you can
safely ignore these as they are normal when running kubernetes proxy inside a
container.

```
W1130 15:42:35.495314       1 server.go:200] Failed to start in resource-only
container "/kube-proxy": mountpoint for cgroup not found
E1130 15:42:35.992946       1 proxier.go:193] Error removing pure-iptables proxy
rule: error checking rule: exit status 2: iptables v1.4.21: Couldn't load target
`KUBE-SERVICES':No such file or directory
Try `iptables -h' or 'iptables --help' for more information.
E1130 15:42:35.999814       1 proxier.go:197] Error removing pure-iptables proxy
rule: error checking rule: exit status 2: iptables v1.4.21: Couldn't load target
`KUBE-SERVICES':No such file or directory
```

The ```resource-only container``` error is because kube-proxy is trying to put
itself in a container like isolation but can not. You can squelch this error by
passing in —resource-container=“”

Here is the kube-proxy.server file I’m using now.
```
[Service]
ExecStart=/usr/bin/docker run --net=host --privileged thrawn01/kubernetes:v1.1.1 /hyperkube proxy \
    —master=https://master.my-domain.orgg \
    —hostname-override=${public_ip} \
    --kubeconfig=/etc/kubernetes/worker-kubeconfig.yaml \
    --resource-container=""
Restart=always
RestartSec=05
[Install]
WantedBy=multi-user.target
```
And here is my Dockerfile for creating my kubernetes images with SSL certs installed

```
FROM gcr.io/google_containers/hyperkube:v1.1.1

RUN mkdir -p /etc/kubernetes/ssl
# Certificate Authority
COPY ssl/ca.pem /etc/kubernetes/ssl
# API Server
COPY ssl/apiserver-key.pem /etc/kubernetes/ssl
COPY ssl/apiserver.pem /etc/kubernetes/ssl
# Worker Certs
COPY ssl/worker-key.pem /etc/kubernetes/ssl
COPY ssl/worker.pem /etc/kubernetes/ssl
# Worker Config
COPY worker-kubeconfig.yaml /etc/kubernetes
# Fix permissions
run chmod 0644 /etc/kubernetes -R
```
