---
tags:
  - programming
  - architecture
  - cloud
date: 2024-02-06
---
All the popular kids have been suggesting that somehow the cloud was mistake, and the cloud Kool-Aid every one drank was spiked, and we are all now drunk or delusional. But the truth is they're doing it wrong.

First, you MUST design your software for the cloud, forget any dreams of taking your existing product and moving it to the cloud and expecting magical cost savings. We've acquired companies that have tried to do this and it never works.

Second, your software must be designed to run on general purpose compute. If your workloads require vertically expensive servers to run, forget it, you are likely better off running on prem with a one-time, super expensive hardware purchase. Everything has to scale horizontally across cheap general purpose compute, including your databases.

Third, Traditional PostgreSQL and MySQL should be avoided. Clustered databases are designed to spread the load across many low-cost general purpose compute and disks. Traditional RDBMS are designed for highly optimized vertical scaling, typically in a Active-Passive HA configuration. This requires big expensive servers multiplied by 3, (1 primary and 2 secondaries) as you scale. If you absolutely need an RDBMS (most people actually don't) then use something that provides Active-Active HA, built-in Clustering and Sharding.

Fourth, separate your compute and storage workloads. This allows you to scale your CPU bound compute quickly (because you don't need an attached disk). This allows you to scale up during peak, and scale down during off peak hours. In this way, your servers are cattle, and not pets. In addition, this allows you apply capacity management to compute and storage separately.

If you can't or don't want to commit to any of these things, then the cloud is not going to be as kind to your wallet as was promised.

The power of the cloud is in low cost general purpose hardware that can be quickly spun up and spun down as needed. If your software is not designed to maximize this advantage then the promise of the cloud can never be truly realized.

See [[Everything scales given the right price]]