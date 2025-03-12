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

### Evaluation: Databases for Startups
But I hear you say, isn't PMF(Product Market Fit) the top priority for any startup? While I do not disagree with this assertion, I will address the topic of evaluating databases from the perspective of a startup to alleviate any concerns. 

To begin, all you need is some napkin math and quick assumptions about what your product is and does. For instance, if you're building a Twitter clone, then you likely don't need anything more complex than [Single Table Design](https://www.alexdebrie.com/posts/dynamodb-single-table/) using a document database. If however, you're building a financial product, then you likely will greatly benefit from using a relational database with strong consistency and transactions. The bottom line is it up to you to do just a little research or reach out to any resources your VC's may provide to choose a DB which values what is important for your product and fits into your target cost structures.

HOWEVER, If you twisted my arm, and asked me to give general advice without prior knowledge of the use case or product. My recommendation is to start with a relational SQL database. This advice holds true, even if you suspect your product will not need relational features. It's better to have them than to be 6 months into your product development cycle and realize you need them.

That being said, you should aspire to use [Single Table Design](https://aws.amazon.com/blogs/compute/creating-a-single-table-design-with-amazon-dynamodb/) as the most efficient way to access data from a relational database is using key value access primitives. (HINT: All relational databases are built upon key value stores, as such this access pattern is highly optimized) Single Table Design keeps the cognitive load of your schema low and the efficiency of data access high. A side benefit, if later you realize you don't need an RDBMS, or would benefit from a noSQL DB, switching to a highly scalable noSQL data store won't require a complete rewrite of your product.

#### Evaluation: Napkin Math
Once you have your high-level design and data model in hand, you can do some quick napkin math to calculate your requirements. First you need an estimate of concurrent active users per day. Then using your product mock-ups you can quickly estimate the number of queries needed to fulfill each user action, from there you can calculate average read/write throughput based on the estimated data required for each query. This gives you an estimated queries per concurrent users and estimated data throughput required. From there you can estimate query costs for cloud databases, or estimate average query time to calculate how big of a database cluster your going to need to support your target concurrent users. If you put the estimated calculations into a spreadsheet app, you can change the estimated concurrent users counts to see how your costs scale as your product grows. See [[PostgreSQL Database Cost Estimation]] for a deep dive on how to do this.

All of this napkin math should take less than a day to achieve. Evaluating resilience should happen AFTER product market fit, and take a bit longer depending on your product.

### Evaluation: Resilience & Operational Costs
Once you've found product market fit, and you're mildly successful, now you can start evaluating cost of operation requirements like high availability, failover, backups, resiliency, etc... This is one of the great benefits of choosing a database out of the Postgres ecosystem as there are many options you could choose from without needing to change wire protocols.

However, in case you need to pivot to a different db, or more likely, you pivot a subset of your data to a different DB, you are not so far into your product development that switching is impossible. If you followed the  [Single Table Design](https://www.datacamp.com/tutorial/single-table-database-design-with-dynamodb) advice, any general database in existence will support a single table design model, which makes it relatively easy to adopt different databases for different aspects of your application as you begin to scale. Using a different DB for different aspects of your product could mean magnitudes of efficiency gained and costs reduced. But remember, only YOU can evaluate if it's worth the risk of introducing a different DB. 

A part of this evaluation is testing resiliency, and recovery. Knowing you have backups isn't as helpful as actually restoring from a backup, and having experienced doing so. Going through that exercise, understanding the pain points and clearly documenting those will be useful when that dreaded day eventually comes. The same goes for testing cluster node failure, and saturation events. Nothing hurts an early stage startup like a full day outage!

### Conclusion
AND THAT'S IT! database evaluation doesn't need to be difficult, costly, or extensive. Early in your startup journey pivoting and agility should be a part of your DNA. Don't forget that designing for database pivot should also be a part of that DNA.

And that is the big takeaway. Evaluate your options, be mindful of your product requirements, understand your limitations, and the limitations of the technology you are using, don't blindly follow the crowd, and if you only hear good things about some tech, be cautious, and keep digging deeper until you find reality.

Proper evaluation should always be a key part of ANY technology adoption, no matter what the internet says, or what anecdotal evidence is provided -- including mine! Every product is different and every operator has different levels of expertise which should be taken into account when adopting any database, self hosted or not.