---
tags:
  - thoughts
date: 2024-07-15
---

Raft is often used for service discovery in Zookeeper, ETCD & Consul because of it's consistent nature. In that a write log is replicated to nodes in the cluster with the leader of the cluster accepting writes. Provided a leader can be elected, raft can accept writes. https://raft.github.io/

But I've wondered for several years if such consistent systems are needed for service discovery and leader election. I've been thinking about this again, as I look into alternatives to using consul due to licensing changes.

Raft itself uses a leader election algorithm to decide who is leader at any given moment. I wrote an implementation of this algorithm a few years ago. https://github.com/thrawn01/election. The election portion of the protocol is eventually consistent, in that multiple nodes may still be participating in a version of the election until they receive a heartbeat from the elected leader, thus signifying the end of the election. This broadcast or heartbeat, is eventually consistent, quorum on the leader is "eventually" achieved and losing candidates are told to get in line. 

Since leader election in Raft is it's self eventually consistent, why would dependent systems need the eventually consistent nature of the raft log/db in order to achieve their leader election? In addition, even though a leader is chosen in the raft DB consistently, notification of that choice is often broadcast to dependent members by "watches", which may or may not have been cancelled or are in the process of re-connection. As such, it could be said that notification of a leadership change does have some hall marks of an eventually consistent system, in that eventually everyone will eventually be notified that the leader has changed. 

Which begs the question, do clusters that depend on ETCD, Consul, Zookeeper, actually need a strongly consistent system for leader election and service discovery?

In my experience writing and using both Consul and ETCD for membership and leader election, I can only think of one reason you would want an eventually consistent system for leader election. To explain what that is, let me explain to the two different ways, you could use ETCD to design a leader election.

1. Each member attempts to gain a "lock" on an agreed upon key/value. If the lock is successful then the "winner" of the lock writes it's leadership information for other members to find. The winner of the lock becomes the leader. All the while, each member in the cluster is constantly attempting to gain a lock, just in case leader unlocks or stops sending liveliness updates to ETCD/Consul.
2. Members in the cluster all register a unique key/value under a specific prefix (aka directory) such that listing all keys with prefix `/my-cluster` will return a list of all the members in the cluster. For example `/my-cluster/node1` , `/my-cluster/node2`. Since the ORDER in which each member wrote it's keys is know to ETCD, each member in the cluster can sort the keys by created date, thus having an ordered list of members. Since it's ordered and very consistent, choosing a leader is easy, the node with the oldest created date is the leader.

The second election design, that of using the prefix is interesting, since it is well known to all members who will become leader next if the current leader delete's their key/value under the agreed prefix. It MIGHT be useful for some distributed systems to know who will become leader next, if the current leader steps down. 

However, I would never design a system which relies upon this ordering, WHY? well, it's possible that....

- Members of the cluster can talk to ETCD, but can't talk to the next member in the list. As such everyone who can talk to ETCD when the leader steps down, will attempt to talk with the next member in the list, even though there is no connectivity to that member. Thus the cluster is left without a leader until connectivity can be restored to the second member -- which is now the first member in the list, and thus defacto leader -- or the second leader leaves the cluster by deleting it's key/value under the prefix.
- Some catastrophic failure has occurred within the cluster and multiple members fail (segfault, etc...) and the next member in the list has also failed, thus leaving members in the cluster attempting to reform on a member that no longer exists. 

Because of this, any resilient distributed system should never make assumptions about ordering of members, when determining leadership. 

If ordering is desired, there are consistent hashes or simple member sorting which can achieve ordering, provided the member list is accurate. In short, you don't need a consistent data store to achieve member ordering. 

I should ask smarter people than me about this, either I'm missing something, or eventually consistent databases just conveniently became popular (aka raft became popular) around the same time as discovery became a thing, and people just started copying what the cool kids where doing, and thus we have raft based strongly consistent databases for implementing discovery and leader election systems for no real reason at all?