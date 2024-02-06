---
tags:
  - architecture
  - database
  - cloud
date: 2021-01-20
---
Writes are harder to scale than reads since databases have to synchronize writes for consistency. Because of this, all consistent databases have primaries or leaders that are responsible for performing the write synchronization.

The reason for this is simple: multiple writes to the same file on disk can clobber each other.

Although databases are designed to handle multiple connections, every entry added to the transaction/WAL/Append Only log has to be handled sequentially. Put another way, many clients on multiple connections and threads can be connected to the server, but only one write can occur to a file at any given point in time.

> A notable feature of PostgreSQL and some other RDBMS is the ability to lock a row for update or insert which allows for parallel writes to a single table, this means PostgreSQL is quite efficient at writes over some other databases. However there is still synchronization over head as transactions, index updates, constraint checks all need to happen sequentially. (Imagine trying to add the same record to a table with a unique constraint simultaneously)

Reads don't have a synchronization problem, as many threads can read a file in parallel. In a typical High Availability (HA) configuration, reads from clients can be sent to multiple secondaries in the cluster. As your read requirement increases you simply add more secondary nodes to the cluster which increases your read capacity. As such, you can scale reads much easier than you can scale writes.

With this in mind, you might design the write path very differently than the read path, thus paying dividends as you scale.
### Avoiding the write synchronization problem
The most efficient way to write to a disk (also applies to network devices like EBS, GBS, etc...) is by writing large blocks of data sequentially on disk. PostgreSQL and MongoDB both make efficient writes to disk by using a WAL or Journal. See [MongoDB: Demystifying Write Durability](https://www.openmymind.net/Demystifying-Write-Durability/)

Writing blocks of data sequentially is why systems like Kafka are so efficient at data ingestion. Each `topic` in Kafka is essentially a collection of append only files, as new data comes in, Kafka appends the new data to the end of the file and records its offset. There still is some write synchronization happening as the Kafka broker might be accepting new data from several clients simultaneously such that it needs to synchronize those writes to the file. However, Kafka solves the write synchronization problem by splitting a `topic` into multiple `partitions`. You can think of a `partition` as a single writer to a single file. If you find that the single writer isn't giving you enough write throughput due to write synchronization, you add more partitions to the `topic`. In this way you spread your writes across multiple partitions there by increasing throughput of the topic. If you run out of IOPS and throughput on one server, Kafka can move partitions to different servers in the cluster, such that a single topic can write to multiple partitions each hosted on different servers. In this manner, Kafka throughput scales horizontally in an almost infinite manner. The total throughput is only limited by the maximum number of partitions and the number of servers in the Kafka cluster. See: [Kafka In a Nutshell](https://sookocheff.com/post/kafka/kafka-in-a-nutshell/ "https://sookocheff.com/post/kafka/kafka-in-a-nutshell/")

This concept of splitting up your data and spreading writes across multiple data flows and multiple servers isn't unique to Kafka, but is what the tech industry refers to as [Sharding](https://www.digitalocean.com/community/tutorials/understanding-database-sharding)

A few high level notes on sharding.
* Avoid building your own sharding system if you can, use a database with built in sharding.
* Write and read once shards is a great pattern to follow (Kafka is such an example)
* Sharding is the easy part, rebalancing is hard. You will eventually need to, don't pretend you won't.