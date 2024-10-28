---
tags:
  - databases
  - software-internals
---

## Related Topics
- [[Write Ahead Logging]]
- [[Transactions]]

## Jepsen
Jepsen is an effort to improve the safety of distributed databases, queues, consensus systems, etc. We maintain an open source [software library](https://github.com/aphyr/jepsen) for systems testing, as well as [blog posts](https://aphyr.com/tags/jepsen) and [conference talks](http://www.ustream.tv/recorded/61443262) exploring particular systems’ failure modes. In each analysis we explore whether the system lives up to its documentation’s claims, file new bugs, and suggest recommendations for operators.
- https://jepsen.io

> _Since 2013, Jepsen has analyzed over two dozen databases, coordination services, and queues—and we’ve found replica divergence, data loss, stale reads, read skew, lock conflicts, and much more. Here’s every analysis we’ve published._
- https://jepsen.io/analyses

## Delta Lake & Iceberg
- [PAPER: Petabyte-Scale Row-Level Operations in Data Lakehouses](https://vldb.org/pvldb/vol17/p4159-okolnychyi.pdf)

## Performance Benchmarking
- https://www.brendangregg.com/activebenchmarking.html

## Indexes
- https://use-the-index-luke.com/ A site explaining SQL indexing to developers—no crap about administration.
- [PAPER: DLHT A Non-blocking Resizable Hashtable with Fast Deletes and Memory-awareness](https://arxiv.org/pdf/2406.09986)
## Concepts
- Fsync Machines vs Join Machines [Two Machines](https://buttondown.com/jaffray/archive/the-two-machines/)
- [How Query Engines Work](https://howqueryengineswork.com/) A query engine is a piece of software that can execute queries against data to produce answers to questions.

## Databases
A list of databases and links to relevant information shared in the channel

#### SQL Server
- [Hekaton: SQL server's memory-optimized OLTP engine](https://dl.acm.org/doi/abs/10.1145/2463676.2463710)

#### PostgreSQL
- [The problem with Postgres replicas](https://neon.tech/blog/the-problem-with-postgres-replicas)

#### Amazon Aurora
- [PAPER: Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases](https://dl.acm.org/doi/10.1145/3035918.3056101)

#### ClickHouse
- [CPU Dispatch in ClickHouse](https://clickhouse.com/blog/cpu-dispatch-in-clickhouse) - How vectorization works, what CPU dispatch is, how to find places for CPU dispatch optimizations and how we use CPU dispatch in ClickHouse.

#### MegaStore
[Megastore: Providing Scalable, Highly Available Storage for Interactive Services](https://www.cidrdb.org/cidr2011/Papers/CIDR11_Paper32.pdf) Megastore is a storage system developed to meet the requirements of today’s interactive online services. Megastore blends the scalability of a NoSQL datastore with the convenience of a traditional RDBMS in a novel way, and provides both strong consistency guarantees and high availability. We provide fully serializable ACID semantics within fine-grained partitions of data. This partitioning allows us to synchronously replicate each write across a wide area network with reasonable latency and support seamless failover between datacenters. This paper describes Megastore’s semantics and replication algorithm. It also describes our experience supporting a wide range of Google production services built with Megastore.




