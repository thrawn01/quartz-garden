---
tags:
  - database
  - design
  - cloud
date: 2024-08-30
---

In case you came here believing that PostgreSQL is the end all be all, I wish to first rant about all the things I wish Vanilla PostgreSQL gave me out of the box.

### Tell me what you want
I want a database that is designed for no downtime upgrades, that is designed for general purpose hardware in the cloud, that is designed to be self healing, that is designed to scale up and scale down to save me money, that is designed for consistent 24 hour operation throughout saturation events, that has replication designed to be backward compatible with other versions in case of a node failure during upgrades, that has a no replication lag surprises, that has support for sharding built in, that supports thousands of client connections without a requiring a third party proxy, that doesn't allow users to naively create schemas that will silently fail 4 years into operation because they used auto incrementing primary keys, that doesn't require a full time DBA on staff to ensure performant operation and uptime, and that allows me to use the resources at my disposal efficiently and keep my operating costs low.

In short, I want a modern database that makes MY product successful. For MY use case, and from MY experience, Vanilla PostgreSQL is not that database, YET......

> [!note]
> A colleague of mine pointed out that most of my wants are provided by some of the Databases within the PostgreSQL ecosystem. I have no personal production experience with those database, so cannot recommend them, but I would encourage readers to check out the many options available!

### Choose the right tool for the job
Saying "Just use PostgreSQL" is about as helpful as saying "Just use a Swiss Army Knife". Sure you could use a Swiss Army Knife to carve a turkey, or sew a new bedroom quilt, but do you really want to? Just because you could, doesn't mean you should! PostgreSQL isn't for everyone and isn't perfect for every product!

YOU must choose the correct database for your operational and technical expertise. You should NEVER preface your decision based on some community vibes or because all the cool kids are doing it. Only YOU can properly evaluate your database costs and requirements which make sense for YOUR product.

Do what is best for your product, through careful evaluation, saturation and use case testing, and you're less likely to regret your decision later. Choosing a database based on someone's tweet however, is a great way to tempt the gods of fate.

### Modern Databases & PostgreSQL
In my experience, the best thing about PostgreSQL isn't the database, but the community and the vibrant innovation happening around the PostgreSQL ecosystem. Many brilliant people are building solutions to many of the problems I point out at the top. Anyone evaluating a database should absolutely include the many PostgreSQL derivatives and extensions in their search for product fit.

Unfortunately for Vanilla PostgreSQL, it continues to carry around the design baggage of a bygone era, where it was assumed the end of the day would come, the lights would go out, people would go home, and the database would end its maintenance cycle just in time for breakfast.

While much of PostgreSQL has been modernized or has pioneered many modern advances in database design over the decades since its first release, those original design assumptions still haunt the PostgreSQL code base today, and crop up in unexpected ways and often at the worst possible moment. This legacy tax is often paid by operators, who jealously cherish their dark knowledge, and are called upon in the darkest hours to work their magic and return the database to operational sanity.

I'm making light of the pain felt by many DBA's over the years, but it's been said that you don't truly know a thing, until you can both explain the good parts, and also explain the bad. If all you've ever heard about a database is how good it is, you know only half of the story. Blindly adopting a database based on community vibes is a sure way to have the knowledge of the bad parts seared into your forehead with fire and blood during your first all night outage.

While I continue to root for PostgreSQL and it's continued march to modernization, I cannot ignore the many new and exciting databases available to the modern software developers with features that have been in production for decades now. We should not dismiss modern databases which have been built upon the knowledge we have gained over the decades. Databases who have made strides in efficiency and scaling characteristics that are a boon to those products who use them.

I have had great experiences with modern databases both personally and professionally, some of which helped me to scale to billions of delivered emails a day without anyone ever suggesting we hire a DBA to manage our many clusters. Often, a new hire would question our choice of database during on boarding. This happened so often, I developed a saying, `We have 99 problems at Mailgun, but MongoDB isn't one of them`. 

With experience comes conviction, conviction to do what is best for your product, test your assumptions and make the best decision based on your own evidence, and not some anecdotal tales from the internet.

### Evaluating Databases
On the topic of evaluating databases before you have product market fit. All you need is some napkin math and quick assumptions about what your product is and does. If you're building a Twitter clone, then you likely do not need anything more complex than [Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/) and a document database. If however, you're building a financial product, then you likely will greatly benefit from using a relational database with strong consistency.

If I'm just giving general advice without prior knowledge of the use case or product. My recommendation is to always start with a relational SQL database, even if you suspect your product will not need relational features. It's better to have them than to be 3 months into your product development cycle and realize you need them.

That being said, You should always begin with [Single Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/) as even when using a relational database that's the most efficient way to use of the database and the keeps your cognitive load low. A side benefit of this, is if later you realize you don't need a Relational DB, and would benefit from a noSQL DB, switching to a highly scalable noSQL data store won't require a complete rewrite of your product.

#### Napkin Math
Once you have your high-level design and data model in hand, you can do some quick napkin math to calculate your requirements. First you need an estimate of concurrent active users per day. Then using your product mock-ups you can quickly estimate the number of queries needed to fulfill each user action, from there you can calculate average read/write throughput based on the estimated data required for each query. This gives you an estimated queries per concurrent users and estimated data throughput required. From there you can estimate query costs for cloud databases, or estimate average query time to calculate how big of a database cluster your going to need to support your target concurrent users. If you put the estimated calculations into a spreadsheet app, you can change the estimated concurrent users counts to see how your costs scale as your product grows. See [[PostgreSQL Database Cost Estimation]] for a deep dive on how to do this.

All of this napkin math should take less than a day to achieve. Evaluating resilience should take a bit longer, depending on your product, and should take place after product market fit.

### Refining your DB Choice
Once you've found product market fit, and you're mildly successful, now you can start evaluating those other cost of operation requirements like high availability, failover, backups and resiliency, etc. This is one of the great benefits of choosing a database out of the Postgres ecosystem as there are many options you could choose from without needing to change wire protocols and do a ton of heavy lifting.

In case you need to pivot to a different db, or pivot a subset of tables to a different DB, you are not so far into your product development that switching is impossible. One of the benefits of [Single Table Design](https://www.datacamp.com/tutorial/single-table-database-design-with-dynamodb) is that any database in existence can support a single table design model. Single Table Design makes it relatively easy to adopt different databases for different aspects of your application as you begin to scale. Using a different DB for different aspects of your product could mean magnitudes of efficiency gained and costs reduced, only you can evaluate if it's worth the risk of introducing a different DB. For example, Mailgun benefited greatly from adopting Cassandra as our main storage for Email bodies while using a document database for email metadata.

A part of this evaluation is testing resiliency, and recovery. Knowing you have backups isn't as helpful as actually restoring from a backup. Actually restoring from a backup of a production system, to understand the pain points and clearly documenting those will be useful when that dreaded day comes. The same goes for testing cluster node failure, and saturation events. Testing and experiencing it first hand, will give you more confidence in your database choice than any brochure can.

### End
PostgreSQL is still a very active and growing project. It is my sincere hope it continues to grow and modernize. But even if it does modernize to cover all of my "wants", the tag line "Just use PostgreSQL" will never be true. Proper evaluation should always be a key part of any technology adoption, no matter how good the brochure makes it look, or what anecdotal evidence is provided. Every product is different and every operator has different levels of expertise which should be taken into account when adopting any database.

And that is the big takeaway. Evaluate your options, be mindful of your product requirements, understand your limitations, and the limitations of the technology you are using, don't blindly follow the crowd, and if you only hear good things about some tech, be cautious, and keep digging deeper until you find reality.