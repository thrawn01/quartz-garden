---
date: 2016-06-06T08:11:27-05:00
title: Why Torus?
slug: why-torus
tags:
  - cloud
  - kubernetes
---

As soon as Torus was announced, allegations of CoreOS suffering from Not
Invented Here (NIH) syndrome began to fly. Kelsey Hightower came to their
defense with this tweet.
<!--more-->

> **CoreOS' Torus reinvents the wheel because it needed to. All infrastructure
must be "reinvented" until we have APIs and true manageability.**

This answer made some sense to me, but might fall short for most people. So I
decided to take a closer look at this project and share what I found. Based on
my findings and understanding of CoreOS goals, I think I have a clearer
understanding of the project motivations. But before I continue, I should
explain CoreOS’ motivations as I understand them.

When I was in Vancouver for the 2015 Summit, I met then CoreOS Principal
Architect Brian Harrington. During that meeting he mentioned something to me
I’ll never forget. *“If we do our job correctly, future releases of CoreOS will
NOT have ssh server installed”*. I was completely blown away by this seemingly
ridiculous statement, as I was very new to containers and orchestration systems
at the time, and made no sense to me. When asked to elaborate, he explained
that users should be able to accomplish everything you might have done in a ssh
session, via API calls. Coupled with CoreOS’ inherent immutability eventually
the operating system will have no need for SSH. So when Hightower mentions
*“APIs and true manageability.”* in his tweet, this idea resonated well with what
Brian mentioned to me almost a year earlier.  This vision is one I’ve seen
reflected in many recent projects related to cloud. The
managing of software and infrastructure should no longer be coupled to a
configuration file and a guy at a terminal, but instead should be configurable
and maintained via a clearly defined set of API’s, and Torus abides by this
rule in spades, not a single config file to be found.


## The Torus Code Base
When diving into the code base, I had assumed to see a simple NBD (Network
Block Device) interface to Torus’s implementation of the DHT (Distributed Hash
Table). and altho this does exist, the big surprise was that Torus also
includes a GoLang implementation of ATA Over Ethernet (AoE)!?


I admit, at first this made no sense, especially with the knowledge that AoE
kernel drivers and a server daemon already exist for Linux. It should be a
simple task to export an NBD backed torus device via existing tools. But
because I still tend to think about infrastructure in a pre container
orchestration world, the necessity of having a user space implementation of AoE
initially eluded me, and some of you might still be scratching you heads
wondering why you might want such a thing? Let me try to explain.


In an container orchestration environment, it should not matter to the
orchestration scheduler which of the nodes in the cluster are running a version
of linux that includes the AoE kernel module. By this I mean, the only thing
the scheduler should care about for our distributed storage cluster is which of
the nodes in the cluster have storage set aside for use by our storage cluster.
In addition, running AoE inside a container allows the scheduler to monitor,
restart or reschedule the AoE server as necessary. This might not be simple or
practical if the daemon is tied to a specific linux module version or kernel
version. Having a user-space implementation is paramount to ensure the
separation of abstraction layers between the kernel and user-space programs.
One of the reasons linux containers are so successful is because user-space
programs written for newer kernels still run on older kernels (provided the
proper libraries are available) because the kernel api has remained consistent
through the life of the kernel. For new projects, maintaining this abstraction
is much more important in a post container orchestration world.


But the question remains, why AoE and not iSCSI? The big kicker here is that
AoE is built on top of TCP framing and bypasses IP routing. As a consequence
AoE servers and clients must be on the same network in order to communicate. In
a cloud environment this may initially appear to be a very bad design on
CoreOS’s part. However, because of it’s networking model, kubernetes
orchestration systems do not have a problem with AoE, as there should be no
need to route traffic for AoE clients and servers to communicate. In addition
to removing the now unnecessary overhead of IP from the frame, the server and
client implementation of AoE is significantly simpler than that of iSCSI *(The
AoE specification is 12 pages compared with iSCSI's 257 pages)* and is arguably
more performant, with better failover support. In short, AoE is a fantastic
choice over iSCSI for kubernetes orchestration systems, is more performant,
simpler to implement with better resilience, a total win for Torus. Nice call
CoreOS!

[See 10 Reasons Why AoE is Awesome](
https://aliver.wordpress.com/2010/02/02/10-reasons-why-aoe-ata-over-ethernet-is-awesome)

## Torus Architecture
Torus Architecture consists of an etcd cluster, which it uses for
configuration, locking, and block metadata. This choice was probably obvious to
the CoreOS team, but in my mind is a brilliant move, and one I wish I had
thought of.

**“Simplicity is prerequisite for reliability” — Dijkstra**

I’ve been tinkering with a Distributed Block Device project of my own that was
to sit on top of a as of yet, un-released high performance DHT which also
happens to be written in GoLang. By abstracting all the consistency, and
locking to etcd, the CoreOS team greatly simplifies the implementation of the
device and block code. By leveraging the primitives that already exist in etcd,
CoreOS demonstrates keen insight in to how they will approach building new and
more complex features as Torus grows. It should not be understated how awesome
this is.

## Configuration and Deployment
Creating a cluster with a volume is super easy, and I didn’t touch a single
configuration file! Just start the `torusd` processes on your storage nodes and
point them to your etcd installation and your done. Creating and managing your
volumes is done by using the client programs `torusctl` and
`torusblk`. Growing the cluster is so easy, just keep adding storage nodes!


As I touched on a little earlier, all of these user land applications are right
at home inside a container, but what makes torus a truly container/cloud native
application is it’s ability to self configure using etcd.  Storage nodes
running `torusd` automatically join and leave the DHT when necessary with no
human intervention required. I have to tell you, I was SUPER impressed at how
quickly I was up and running with Torus.  Working on the Cloud Block Storage
team at Rackspace, I’ve dealt with several different types of distributed
storage solutions. If Torus can continue this kind of simplicity, easy of use
and management as it’s capabilities grow, this will be a fantastic storage
product!

# Conclusion
The code is clean and understandable, The architecture is sound, The choice of
AoE and etcd as metadata store is brilliant. There is alot to like about Torus,
and as the project continues to grow I have no doubt we will see great things
from this project. At this point in the project’s life you can’t honestly
compare Torus with other more mature distributed storage products, but there is
ton of potential here.

