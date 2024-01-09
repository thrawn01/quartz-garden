---
tags:
  - cloud
  - kubernetes
date: 2016-04-12T10:17:27Z
title: Kubernetes and Openstack
---

Openstack provides fantastic capabilities Enterprise companies can leverage to
manage their infrastructure in addition provide supportive capabilities that
applications can directly take advantage of like Swift and Keystone. As a whole
open stack has a rich suite of tools that make it very compelling for
enterprise companies to run their infrastructure on. The one area where open
stack falls short is an application orchestration. That being said, it does
have a project called Heat which attempt to fill this gap,  but the adoption of
heat as an application deployment platform and orchestration system has been
lacking.
<!--more-->

Recently the industry has realized that as applications grow in complexity they
require a new level of resilience and reactive capabilities. In the past's
companies have attempted to use configuration management systems to fill this
orchestration gap, but as anyone who has attempted to implement this
orchestration layer using configuration management system with tools like
Ansible, Puppet or Salt knows; These systems can get very complex, very quickly
and can become a management nightmare.
Fortunately, Google has been quietly implementing a new kind orchestration
management system internally for the last 10 years; and has only recently
started to share this knowledge and implement a publicly available version of
this orchestration system in the form of a project called Kubernetes.

The real innovation that Google discovered with its 10 years of experience and
that Kubernetes brings to the rest of the world is the idea of immutable
infrastructure. Without going into too much detail here; as I plan on writing
another post about this topic. Immutable infrastructure reduces the complexity
that is required of the orchestration system which allows your orchestration
system to focus on keeping your application up and making it resilient to
failures, instead of managing the deep granularity that configuration
management systems typically provide. The industry has recently been referring
to this new way of orchestrating applications and infrastructure as Google
Infrastructure For Everyone Else or GIFEE for short.

Although what kubernetes provides is very compelling, there are still many
missing pieces to running a complete infrastructure and application
orchestration stack. This is where I believe the marriage of open stack and
kubernetes could really benefit the industry.

In a  small way it’s already happening;  for instance the latest release of
Kubernetes added support for provisioning volumes with Openstack Cinder.  In
addition recently there has been some discussion as to how kubernetes can
leverage Keystone is an authentication system. In fact the policy system
proposal for Kubernetes is modeled after the Keystone policy system so the two
communities are already learning from each other. This collaboration could
become even more pronounced now that CoreOS and Intel have announced a joint
project to deploy Openstack on top Kubernetes.
https://tectonic.com/press/intel-coreos-collaborate-on-openstack-with-kubernetes.html

What might be lost on some is the realization that once you have launched opens
stack on top of the kubernetes orchestration system, kubernetes can then make
use of that same deployment to manage its infrastructure!  So instead of
thinking Openstack runs on Kubernetes; instead think of it more as a symbiotic
relationship where Kubernetes manages the orchestration of the open stack
control plane (which historically can be very complex to manage) and Openstack
manages the creation and provisioning of additional infrastructure resources
for Kubernetes to orchestrate.

Now…. Having said all this, there is definitely some overlap between the two
projects and here I'm mostly thinking of Nova, Magnum and Heat. Additionally
with the most recent release of Kubernetes, it can now schedule virtual
machines within the cluster that it manages. Despite this overlap I still
believe there is a opportunity for both communities to work together and create
an infrastructure management stack that starts at the bare metal and runs all
the way to the application.

