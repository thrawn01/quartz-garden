---
tags:
  - database
  - design
  - cloud
date: 2024-08-30
---

Saying "Just use PostgreSQL" is about as helpful as saying "Just use a Swiss Army Knife". Sure you could use a Swiss Army Knife to carve a turkey, or sew a new bedroom quilt, but do you really want to? Just because you could, doesn't mean you should! PostgreSQL isn't for everyone and far from the perfect database for every product and use case!

YOU must choose the correct database for your operational and technical expertise. You should NEVER preface your decision based on some community vibes or because all the cool kids are doing it. Only YOU can properly evaluate your database costs and requirements which make sense for YOUR product.

Do what is best for your product, through careful evaluation, saturation and use case testing, and you're less likely to regret your decision later. Choosing a database based on someone's tweet however, is a great way to tempt the gods of fate.

### What I can't get from PostgreSQL
I want a database that is designed for no downtime upgrades, that is designed for general purpose hardware in the cloud, that is designed to be self healing, that is designed to scale up and scale down to save me money, that is designed for consistent 24 hour operation throughout write saturation events, that has replication designed to be backward compatible with other versions in case of a node failure during upgrades, that has a no replication lag surprises, that has support for sharding built in, that supports thousands of client connections without a requiring a third party proxy, that doesn't allow users to naively create schemas that will silently fail 4 years into operation because they used auto incrementing primary keys, that doesn't have surprise transaction failures if async maintenance jobs fail, that doesn't require a full time DBA on staff to ensure performant operation and uptime, and that allows me to use the resources at my disposal efficiently and keep my operating costs low.

In short, I want a modern database that makes MY product successful. For MY use case, and from MY experience, Vanilla PostgreSQL is not that database, YET......

> [!note]
> A colleague of mine pointed out that most of my wants are provided by some of the Databases within the PostgreSQL ecosystem. I have no personal production experience with those databases, so cannot recommend them, but I would encourage readers to check out the many options available!

### Modern Databases & PostgreSQL
In my experience, the best thing about PostgreSQL isn't the database, but the community and the vibrant innovation happening around the PostgreSQL ecosystem. Many brilliant people are building solutions to many of the problems I point out at the top. Anyone evaluating a database should absolutely include the many PostgreSQL derivatives and extensions in their search for product fit.

Unfortunately for Vanilla PostgreSQL, it continues to carry around the design baggage of a bygone era, where it was assumed the end of the day would come, the lights would go out, people would go home, and the database would end its maintenance cycle just in time for breakfast.

While much of PostgreSQL has been modernized or has pioneered many modern advances in database design over the decades since its first release, those original design assumptions still haunt the PostgreSQL code base today, and crop up in unexpected ways and often at the worst possible moment. This legacy tax is often paid by operators, who jealously cherish their dark knowledge, and are called upon in the darkest hours to work their magic and return the database to operational sanity.

I'm making light of the pain felt by many DBA's over the years, but it's been said that you don't truly know a thing, until you can both explain the good parts, and also explain the bad. If all you've ever heard about a database is how good it is, you know only half of the story. Blindly adopting a database based on community vibes is a sure way to have the knowledge of the bad parts seared into your forehead with fire and blood during your first all night outage.

Operators should NEVER ignore the many new and exciting databases available to modern software developers that have a proven track record of reliability and resiliency in production for decades now. We should not dismiss modern databases which have been built upon the knowledge that has been gained in the decades since PostgreSQL first released in 1989. Databases who have made strides in efficiency and scaling characteristics that are a boon to those products and companies who use them.

I have had great experiences with modern databases both personally and professionally, some of which helped me scale to billions of delivered emails a day, all without anyone ever suggesting we hire a DBA, or experience costly outages because of a DB design deficiency. So many new hires would question our choice of database during on boarding that I developed a saying, `We have 99 problems at Mailgun, but MongoDB isn't one of them`. 

With experience comes conviction, conviction to do what is best for your product, test your assumptions and make the best decision based on your own evidence, and not some anecdotal tales from the internet.

### Evaluation: Databases for Startups
I mentioned above that an important part of choosing a database is evaluation. Several founders have challenged me on this, asserting that PMF(Product Market Fit) is the top priority for any startup. While I do not disagree with this assertion, I will address the topic of evaluating databases from the perspective of a startup to alleviate any concerns. 

To begin, all you need is some napkin math and quick assumptions about what your product is and does. For instance, if you're building a Twitter clone, then you likely don't need anything more complex than [Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/) using a document database. If however, you're building a financial product, then you likely will greatly benefit from using a relational database with strong consistency and transactions. The bottom line is it up to you to do just a little research or reach out to any resources your VC's may provide to choose a DB which values what is important for your product and fits into your target cost structures.

HOWEVER, If you twisted my arm, and asked me to give general advice without prior knowledge of the use case or product. My recommendation is to start with a relational SQL database. This advice holds true, even if you suspect your product will not need relational features. It's better to have them than to be 6 months into your product development cycle and realize you need them.

That being said, you should aspire to use [Single Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/) as the most efficient way to access data from a relational database is using key value access primitives. (HINT: All relational databases are built upon key value stores, as such this access pattern is highly optimized) Single Table Design keeps the cognitive load of your schema low and the efficiency of data access high. A side benefit, if later you realize you don't need an RDBMS, or would benefit from a noSQL DB, switching to a highly scalable noSQL data store won't require a complete rewrite of your product.

#### Evaluation: Napkin Math
Once you have your high-level design and data model in hand, you can do some quick napkin math to calculate your requirements. First you need an estimate of concurrent active users per day. Then using your product mock-ups you can quickly estimate the number of queries needed to fulfill each user action, from there you can calculate average read/write throughput based on the estimated data required for each query. This gives you an estimated queries per concurrent users and estimated data throughput required. From there you can estimate query costs for cloud databases, or estimate average query time to calculate how big of a database cluster your going to need to support your target concurrent users. If you put the estimated calculations into a spreadsheet app, you can change the estimated concurrent users counts to see how your costs scale as your product grows. See [[PostgreSQL Database Cost Estimation]] for a deep dive on how to do this.

All of this napkin math should take less than a day to achieve. Evaluating resilience should happen AFTER product market fit, and take a bit longer depending on your product.

### Evaluation: Resilience & Operational Costs
Once you've found product market fit, and you're mildly successful, now you can start evaluating cost of operation requirements like high availability, failover, backups, resiliency, etc... This is one of the great benefits of choosing a database out of the Postgres ecosystem as there are many options you could choose from without needing to change wire protocols.

However, in case you need to pivot to a different db, or more likely, you pivot a subset of your data to a different DB, you are not so far into your product development that switching is impossible. If you followed the  [Single Table Design](https://www.datacamp.com/tutorial/single-table-database-design-with-dynamodb) advice, any general database in existence will support a single table design model, which makes it relatively easy to adopt different databases for different aspects of your application as you begin to scale. Using a different DB for different aspects of your product could mean magnitudes of efficiency gained and costs reduced. But remember, only YOU can evaluate if it's worth the risk of introducing a different DB. 

A part of this evaluation is testing resiliency, and recovery. Knowing you have backups isn't as helpful as actually restoring from a backup, and having experienced doing so. Going through that exercise, understanding the pain points and clearly documenting those will be useful when that dreaded day eventually comes. The same goes for testing cluster node failure, and saturation events. Nothing kills an early stage startup like a full day outage!

AND THAT'S IT! database evaluation doesn't need to be difficult, costly, or extensive. Early in your startup journey pivoting and agility should be a part of your DNA. Don't forget that designing for database pivot should also be a part of that DNA.

> [!note]
> During my time at Mailgun, we benefited greatly from pivoting to Cassandra as our main storage for email, while we continued to use a document database for email metadata, account, and billing data.

### Why PostgreSQL is Terrible
My earlier lament on what I want from PostgreSQL comes from years of experience running and using various databases, including PostgreSQL. While this post isn't intended as a deep dive into the inadequacies of PostgreSQL, my spidey senses are twitching at the inevitable hate mail I expect to receive from the PostgreSQL die-hards. For those who might imagine that my assertion of "PostgreSQL carries around the design baggage of a bygone era" is unwarranted, here are some references which may satisfy the curious.

[Why PostgreSQL’s MVCC is the Worst](https://www.cs.cmu.edu/~pavlo/blog/2023/04/the-part-of-postgresql-we-hate-the-most.html) 
> We will be blunt: if someone is going to build a new MVCC DBMS today, they should **not** do it the way PostgreSQL does (e.g., append-only storage with autovacuum). In our [2018 VLDB paper](https://db.cs.cmu.edu/papers/2017/p781-wu.pdf) (aka “ [the best paper ever on MVCC](https://twitter.com/andy_pavlo/status/902863242774634496)“), we did not find another DBMS doing MVCC the way PostgreSQL does it. Its design is a relic of the 1980s and before the proliferation of [log-structured](https://en.wikipedia.org/wiki/Log-structured_merge-tree) system patterns from the 1990s.

[Why Uber Engineering Switched from Postgres to MySQL](https://www.uber.com/blog/postgres-to-mysql-migration/) 
> We encountered many Postgres limitations: Inefficient architecture for writes, Inefficient data replication, Issues with table corruption, Poor replica MVCC support, Difficulty upgrading to newer releases

[Oxide Podcast: The challenges of operating PostgreSQL at scale](https://oxide.computer/podcasts/oxide-and-friends/2052742) during their time at [Joyent](https://www.joyent.com/) and how [autovacuum caused an outage](https://www.tritondatacenter.com/blog/manta-postmortem-7-27-2015) starts at about 20 minutes into the podcast. (This podcast was the inspiration for this blog post)
> "We found a lot of behavior around synchronous replication that was either undocumented, or poorly documented and not widely understood, which contributed to a feeling that this thing (PostgreSQL) was really hard to operationalize. Even if you know about these things, they are very hard to workaround, and fix."

[Transaction ID Wraparound Outage](https://blog.sentry.io/transaction-id-wraparound-in-postgres/) which took Sentry down for most of the working day. 
> "The internet is full of awful advice from users suggesting you should turn off autovacuum, or run it manually at low traffic times, or simply adjust its schedule to run less often. To know why that’s ill-advised, you first need to understand the consequences of autovacuum not running....."

### End
I want to reiterate my support for the PostgreSQL community! PostgreSQL is a great open source PROJECT, it's just not a great PRODUCT. PostgreSQL continues to be a very active and growing project and it is my sincere hope it continues to grow and modernize. But even if it does modernize, the advice of "Just use PostgreSQL" will never be true. Proper evaluation should always be a key part of any technology adoption, no matter what the internet says, or what anecdotal evidence is provided -- including mine! Every product is different and every operator has different levels of expertise which should be taken into account when adopting any database, self hosted or not.

And that is the big takeaway. Evaluate your options, be mindful of your product requirements, understand your limitations, and the limitations of the technology you are using, don't blindly follow the crowd, and if you only hear good things about some tech, be cautious, and keep digging deeper until you find reality.

PS: I am in no way affiliated with any database company or product, my views are my own.