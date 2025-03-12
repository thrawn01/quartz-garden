---
tags:
  - database
  - cloud
date: 2024-06-30
---

NOTE: The following is a rant about PostgreSQL, a database system I've both used and admired in numerous high-performance workloads throughout my 20+ years in the industry. That doesn't mean however, that I think it's perfect.

### What I can't get from PostgreSQL
I want a database that is designed for no downtime upgrades, that is designed for general purpose hardware in the cloud, that is designed to be self healing, that is designed to scale up and scale down to save me money, that is designed for consistent 24 hour operation throughout write saturation events, that has replication designed to be backward compatible with other versions in case of a node failure during upgrades, that has a no replication lag surprises, that has support for sharding built in, that supports thousands of client connections without a requiring a third party proxy, that doesn't allow users to naively create schemas that will silently fail 4 years into operation because they used auto incrementing primary keys, that doesn't have surprise transaction failures if async maintenance jobs fail, that doesn't require a full time DBA on staff to ensure performant operation and uptime, and that allows me to use the resources at my disposal efficiently and keep my operating costs low.

In short, I want a modern database that makes MY product successful. For MY use case, and from MY experience, Vanilla PostgreSQL is not that database, YET......

> [!note]
> When I say "Vanilla PostgreSQL" I'm referring to the OpenSource PostgreSQL you download from https://www.postgresql.org/

### Modern Databases & PostgreSQL
In my experience, the best thing about PostgreSQL isn't the database, but the community and the vibrant innovation happening around the PostgreSQL ecosystem. Many brilliant people are building solutions to many of the problems I point out at the top. Anyone evaluating a database should absolutely include the many PostgreSQL derivatives and extensions in their search for product fit.

Unfortunately for Vanilla PostgreSQL, it continues to carry around the design baggage of a bygone era, where it was assumed the end of the day would come, the lights would go out, people would go home, and the database would end its maintenance cycle just in time for breakfast.

While much of PostgreSQL has been modernized or has pioneered many modern advances in database design over the decades since its first release, those original design assumptions still haunt the PostgreSQL code base today, and crop up in unexpected ways and often at the worst possible moment. This legacy tax is often paid by operators, who jealously cherish their dark knowledge, and are called upon in the darkest hours to work their magic and return the database to operational sanity.

I'm making light of the pain felt by many DBA's over the years, but it's been said that you don't truly know a thing, until you can both explain the good parts, and also explain the bad. If all you've ever heard about a database is how good it is, you know only half of the story. Blindly adopting a database based on community vibes is a sure way to have the knowledge of the bad parts seared into your forehead with fire and blood during your first all night outage.

Operators should NEVER ignore the many new and exciting databases available to modern software developers that have a proven track record of reliability and resiliency in production for decades now. We should not dismiss modern databases which have been built upon the knowledge that has been gained in the decades since PostgreSQL first released in 1989. Databases who have made strides in efficiency and scaling characteristics that are a boon to those products and companies who use them.

I have had great experiences with modern databases both personally and professionally, some of which helped me scale to billions of delivered emails a day, all without anyone ever suggesting we hire a DBA, or experience costly outages because of a DB design deficiency. So many new hires would question our choice of database during on boarding that I developed a saying, `We have 99 problems at Mailgun, but MongoDB isn't one of them`. 

With experience comes conviction, conviction to do what is best for your product, test your assumptions and make the best decision based on your own evidence, and not some anecdotal tales from the internet.

### Why is PostgreSQL Terrible?
For those who might imagine that my assertion of "PostgreSQL carries around the design baggage of a bygone era" is unwarranted, here are some references which may satisfy the curious.

[Why PostgreSQL’s MVCC is the Worst](https://www.cs.cmu.edu/~pavlo/blog/2023/04/the-part-of-postgresql-we-hate-the-most.html) 
> We will be blunt: if someone is going to build a new MVCC DBMS today, they should **not** do it the way PostgreSQL does (e.g., append-only storage with autovacuum). In our [2018 VLDB paper](https://db.cs.cmu.edu/papers/2017/p781-wu.pdf) (aka “ [the best paper ever on MVCC](https://twitter.com/andy_pavlo/status/902863242774634496)“), we did not find another DBMS doing MVCC the way PostgreSQL does it. Its design is a relic of the 1980s and before the proliferation of [log-structured](https://en.wikipedia.org/wiki/Log-structured_merge-tree) system patterns from the 1990s.

[Why Uber Engineering Switched from Postgres to MySQL](https://www.uber.com/blog/postgres-to-mysql-migration/) 
> We encountered many Postgres limitations: Inefficient architecture for writes, Inefficient data replication, Issues with table corruption, Poor replica MVCC support, Difficulty upgrading to newer releases .... Postgres does not have true replica MVCC support. The fact that replicas apply WAL updates results in them having a copy of on-disk data identical to the master at any given point in time. This design poses a problem for Uber.

[Oxide Podcast: The challenges of operating PostgreSQL at scale](https://oxide.computer/podcasts/oxide-and-friends/2052742) during their time at [Joyent](https://www.joyent.com/) and how [autovacuum caused an outage](https://www.tritondatacenter.com/blog/manta-postmortem-7-27-2015) starts at about 20 minutes into the podcast. (This podcast was the inspiration for this blog post)
> "We found a lot of behavior around synchronous replication that was either undocumented, or poorly documented and not widely understood, which contributed to a feeling that this thing (PostgreSQL) was really hard to operationalize. Even if you know about these things, they are very hard to workaround, and fix."

[Transaction ID Wraparound Outage](https://blog.sentry.io/transaction-id-wraparound-in-postgres/) which took Sentry down for most of the working day. 
> "The internet is full of awful advice from users suggesting you should turn off autovacuum, or run it manually at low traffic times, or simply adjust its schedule to run less often. To know why that’s ill-advised, you first need to understand the consequences of autovacuum not running....."

[PostgreSQL Mistakes and How to Avoid Them](https://www.manning.com/books/postgresql-mistakes-and-how-to-avoid-them)
I know its a bit disingenuous of me, but I find the title of this book hilarious. The fact that someone felt the need to write a book covering pit falls and mistakes that will bite you in production speaks to me. The book also contains practical advice that applies to all databases, not just PostgreSQL. For instance, making backups regular, using point in time snapshots and how not to abuse SQL.

### Conclusion
PostgreSQL is a great open source PROJECT, it's just not a great PRODUCT in that there are many many sharp edges, and if you are not careful, you can easily fall into the pit of failure. This is especially true when compared to modern databases designed from the ground up to take advantage of the last 40 years of database advancement and that greatly improve upon the failure modes.

There are several databases revolving around the PostgreSQL ecosystem or have PostgreSQL compatibility which fill in some of the gaps left by Vanilla PostgreSQL. I have no personal production experience with those databases, but I would encourage readers to check out the many options available! 
- [Neon](https://neon.tech/home) 
- [YugaByte](https://www.yugabyte.com/)
- [CockroachDB](https://www.cockroachlabs.com/) 
- [Supabase](https://supabase.com/)

To reiterate, the PostgreSQL community continues to be a very active and growing project and I am positive it will continue to grow and modernize. 