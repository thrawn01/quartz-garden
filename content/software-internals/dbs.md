This is a resource page listing topics and links for information shared on the [Software Internals Discord - Database Channel](https://discord.gg/ThMHHj8rSV)

This is not intended to be an exhaustive list of all links shared in the channel. But is instead a repository of quality information shared in the channel about database and related topics. Open a pull request on [github.com](https://github.com/thrawn01/quartz-garden/software-internals) if
you wish to add or correct anything.

# Topics
These are some major topics covered in the channel

## WAL Checksums
> "sqlite has no checksums and is thus irresponsible for production use" -- Miller

Discussion regarding the reliability of transactions when used in database systems that employ a WAL without checksums to verify the integrity of the transaction. 

### SQLite has no WAL checksums
> SQLite assumes that the detection and/or correction of bit errors caused by cosmic rays, thermal noise, quantum fluctuations, device driver bugs, or other mechanisms, is the responsibility of the underlying hardware and operating system. SQLite does not add any redundancy to the database file for the purpose of detecting corruption or I/O errors. SQLite assumes that the data it reads is exactly the same data that it previously wrote. https://www.sqlite.org/atomiccommit.html

> A simple bit flip in the WAL can silently lose committed entries. This is because when a corrupted entry is found in the log, SQLite truncates it, despite the existence of successfully committed entries later in the log. https://github.com/danthegoodman1/BreakingSQLite 

### CRDB has no WAL checksums
>FROM: Cockroach Labs Support, Oct. 3 2024:
> _”As you surmised when it comes to SSTs CRDB does have mechanisms to detect and handle bit rot, particularly in its distributed storage system. When data is stored in SST (Sorted String Table) files, the distributed nature of CRDB allows it to recover from such corruption by replicating data across multiple nodes._
 > _However, when it comes to the Write-Ahead Log (WAL), the situation is more complex. If there is corruption in the middle of the WAL, CRDB does not have a built-in mechanism to repair the corrupted WAL entries. Instead, it follows a similar approach to other SQL databases like SQLite and PostgreSQL, where the corrupted WAL would be truncated, potentially leading to the loss of commits that occurred after the corrupted data._
 > _That isn't to say we've abandoned the idea of being able to handle WAL corruption we just haven't landed on a solution and are still iin the process of theory-crafting it._

### AWS Aurora has WAL checksums
> _AWS, Oct. 3 2024:_
> _”In the event of bit-rot or any corruption in the WAL file, Amazon Aurora automatically detects the issue using checksums and repairs the corrupted data by retrieving valid copies from other storage nodes. It does not truncate the WAL; instead, it repairs it to ensure data integrity and availability.”_

> The only ones I know of that are truly safe are AWS aurora, tigerbeetle, and foundationdb -- Dan


# Transactions

### ANSI Isolation Levels
We've known since 1995, the standard Isolation levels defined by ANSI are terrible
- [A critique of ANSI SQL Isolation layers (Transaction Processing Book followup)](https://muratbuffalo.blogspot.com/2024/04/a-critique-of-ansi-sql-isolation-layers.html)
- [PAPER: # A critique of ANSI SQL isolation levels](https://dl.acm.org/doi/10.1145/223784.223785)

# Jepsen
Jepsen is an effort to improve the safety of distributed databases, queues, consensus systems, etc. We maintain an open source [software library](https://github.com/aphyr/jepsen) for systems testing, as well as [blog posts](https://aphyr.com/tags/jepsen) and [conference talks](http://www.ustream.tv/recorded/61443262) exploring particular systems’ failure modes. In each analysis we explore whether the system lives up to its documentation’s claims, file new bugs, and suggest recommendations for operators.
- https://jepsen.io

> _Since 2013, Jepsen has analyzed over two dozen databases, coordination services, and queues—and we’ve found replica divergence, data loss, stale reads, read skew, lock conflicts, and much more. Here’s every analysis we’ve published._
- https://jepsen.io/analyses

# Delta Lake & Iceberg
- [PAPER: Petabyte-Scale Row-Level Operations in Data Lakehouses](https://vldb.org/pvldb/vol17/p4159-okolnychyi.pdf)

# Performance Benchmarking
- https://www.brendangregg.com/activebenchmarking.html

# Indexes
- https://use-the-index-luke.com/ A site explaining SQL indexing to developers—no crap about administration.
- [PAPER: DLHT A Non-blocking Resizable Hashtable with Fast Deletes and Memory-awareness](https://arxiv.org/pdf/2406.09986)
- 

# Education
- https://cs186berkeley.net/resources/ - CS 186 Resources
- https://pdos.csail.mit.edu/6.824/ - MIT 6.5840: Distributed Systems (See Schedule for Lecture Recordings)


# In Practice
- [Netflix is a strong Cassandra and Cockroach shop](https://www.cockroachlabs.com/blog/netflix-at-cockroachdb/)
- [Databricks uses a bunch of MySQL/RDS and shuffling towards TiDB](https://www.pingcap.com/case-study/how-databricks-tackles-the-scalability-limit-with-a-mysql-alternative/)
- [How discord indexes billions of messages](https://discord.com/blog/how-discord-indexes-billions-of-messages)

# Concepts
- Fsync Machines vs Join Machines [Two Machines](https://buttondown.com/jaffray/archive/the-two-machines/)

# Databases
A list of databases and links to relevant information shared in the channel

#### SQL Server
- [Hekaton: SQL server's memory-optimized OLTP engine](https://dl.acm.org/doi/abs/10.1145/2463676.2463710)

#### PostgreSQL
- [The problem with Postgres replicas](https://neon.tech/blog/the-problem-with-postgres-replicas)

#### Amazon Aurora
- [PAPER: Amazon Aurora: Design Considerations for High Throughput Cloud-Native Relational Databases](https://dl.acm.org/doi/10.1145/3035918.3056101)

#### ClickHouse
- [CPU Dispatch in ClickHouse](https://clickhouse.com/blog/cpu-dispatch-in-clickhouse) - How vectorization works, what CPU dispatch is, how to find places for CPU dispatch optimizations and how we use CPU dispatch in ClickHouse.

# Cache
- [What does a cache do?](https://buttondown.com/nelhage/archive/what-does-a-cache-do/)
- [PAPER: Kangaroo - Theory and Practice of Caching Billions of Tiny Objects on Flash](https://saramcallister.github.io/files/2022-tos-mcallister.pdf)
- [# Hokkaido Television Broadcasting unlocks cost savings and performance improvements with Momento Cache](https://www.gomomento.com/resources/case-studies/hokkaido-television-broadcasting-unlocks-cost-savings-and-performance-improvements-with-momento-cache/)
- [How Uber Serves Over 40 Million Reads Per Second from Online Storage Using an Integrated Cache](https://www.uber.com/en-EG/blog/how-uber-serves-over-40-million-reads-per-second-using-an-integrated-cache/)
- [A large scale analysis of hundreds of in-memory cache clusters at Twitter](https://www.usenix.org/conference/osdi20/presentation/yang)
- [Scaling memcache at Facebook](https://research.facebook.com/publications/scaling-memcache-at-facebook/)
- 

# Distributed
- [How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)


# Popular Blogs
- https://buttondown.com/jaffray aka https://justinjaffray.com/
- https://www.brendangregg.com/overview.html
- 