---
date: 2024-06-20
tags:
  - architecture
  - education
  - database
  - design
---

These are my comments on this article. [The Great Migration from MongoDB to PostgreSQL](https://medium.com/@tony.infisical/the-great-migration-from-mongodb-to-postgresql-fa3978bc143b)

### The Spicy TLDR
They do not understand how to model their data or build their app to take advantage of the performance improvements a Document DB provides. Instead they modeled it in such a way as to increase their dependence on a relational model, which unsurprisingly reduced performance. They unwittingly blamed this upon MongoDB. Instead of attempting to understand how to use a document db properly by reaching out to MongoDB or the community, they went through a migration to a different database.

Honestly, I'm not blaming them. From my experience with such things, they likely had developers with deep RDBMS experience, which led them along this course. It unfortunate that this happens all the time! 

### There is nothing wrong with PostgreSQL or MongoDB.
Simply put, if you're trying to use MongoDB like an RDBMS -- with relationships and an over dependence upon distributed transactions -- then you're on the path to failure. This isn't a MongoDB failure, it's a design failure.

> With demand growing for self-hosting Infisical, we found ourselves shipping many features catered to reducing the learning curve needed to self-host Infisical and, as part of that, we ended up leaving MongoDB in favor of PostgreSQL. -- [The Great Migration from MongoDB to PostgreSQL](https://medium.com/@tony.infisical/the-great-migration-from-mongodb-to-postgresql-fa3978bc143b)

I completely understand this point of view. PostgreSQL has a much wider audience, has a very open license similar to the BSD or MIT licenses, and it has a great many developers and operators which have experience using and working with PostgreSQL. I personally love using PostgreSQL! However, as will touch on later in this article, they could have easily supported both databases! 

The driving point of my comments here is, if you choose the right data model, you can easily support many, many different databases with ease. As an open source project, many of those supported databases could be contributed by third party contributors. Provided your data model is compatible.

### The Spicy Take
Fortunately, since this is an open source project, we can inspect the code to understand their use case...... And this is where I get spicy......

Unfortunately, the project appears to be written entirely in typescript.... which leads me to think performance and scale isn't their top priority and likely lack expertise in building systems that scale efficiently. I also note that they make use of both Redis and PostgreSQL. Securing one system is hard enough, yet they took it upon themselves to create multiple attack surfaces for their security product. I'm assuming, due to their dependence upon a RDBMS, and their performance eating relational model, they need a Redis cache to bring performance back up to acceptable levels.

> With the correct data model, the time complexity of every NoSQL query is `O(log(n))`. This is blazing fast compared to the simplest RDBMS join. One accurate measurement is worth a thousand expert opinions. Run the workload on both platforms with a proper data model, then laugh -- [Rick Houlihan - Inventor of DynamoDB](https://twitter.com/houlihan_rick/status/1592511035780763648?ref=highscalability.com)
 
Contrast this to a similar product, [Vault](https://github.com/hashicorp/vault). Vault uses BoltDB which is a simple embedded key value store and uses Raft for replication with no other external dependencies. Since a key value store like BoltDB has `O(log(n))` complexity, vault will out scale anything using a relational model. In addition to avoiding any additional attack surfaces. Granted, building your own replication model probably isn't a good idea in most circumstances, but for a security product, it makes sense for vault to take this route.

`</spicy take>`

### It's not the me, it's you
The key take away from this article should be. IT'S NOT THE DATABASE, IT'S HOW YOU ARE USING THE DATABASE that is the problem. The [Infisical](https://github.com/Infisical/infisical) team might have continued to use MongoDB with no issues or used another Document DB with a better license. Indeed, at this point, there is no need for them to switch back from PostgreSQL! You CAN and SHOULD use PostgreSQL as a key value store! Under the hood all databases are essentially key value stores, which means, they are at their most efficient when used as such! 

Unfortunately many people use and abuse the features that RDBMS provides on top of that key value store. When they then run into performance problems, they switch databases, often remodel their data in the process, after which they point and scream, SEE!!!! X DATABASE IS MO BETTA THAN Y DATABASE.

No, No, No, No. Just stop abusing the database you have.

I'm not saying that each database doesn't have their own advantages or disadvantages, they absolutely do. The databases that lean heavily into their key/value nature, have higher efficient scaling properties. Those who lean into their relational qualities have higher data consistency and typically rigorous schema contracts and referential integrity. Not to mention Vector, and Graph databases. One of the problems, as I see it, isn't the database you are using, it is that if you learned one database, and you only know how to build and model applications from the perspective of that database, your data model designs are going to lean toward whatever idiomatic database model you learned from. This is a problem.

### You can only build what you know
When I do interviews, I'll often ask the candidate to whiteboard a product which creates and sells widgets. 80% of candidates begin by building relational database tables, and I die a little inside each time. They do this, because all they have ever known is relational database applications and modeling. 

You can only build what you know. So I don't blame the candidates, I don't blame the [Infisical] team. I blame the database wars that persist within the open source community. We need to start broadcasting the truth about the database wars. It's less about the database, and more about how you model your data that makes your database a success or not. We need to do a better job of teaching these fundamental data modeling concepts and their trade offs.

HINT: The correct answer to the "whiteboard a product which create and sells widgets" is to design the interface first (UI, or API is acceptable). The public interface will then dictate your data model. You should always build from the top down, not the bottom up.

### Single Table Design Is Not A Curse
I've encountered several individuals who have this deep rooted belief that [single table design (1)](https://www.gomomento.com/blog/single-table-design-for-dynamodb-the-reality) is a curse which is inflicted upon a developer due to the constraint of using a nosql database. 

The truth is, [single table design (2)](https://www.alexdebrie.com/posts/dynamodb-single-table/) is less about your database of choice, and more about increasing performance and scale. You can gain so much from using the [single table design (2)](https://emshea.com/post/part-1-dynamodb-single-table-design) methodology with your existing RDBMS, that once you start hitting the limits of your RDBMS, moving to a nosql or document style database for continued scale is easy. For those on-prem customers who prefer PostgreSQL, you can support RDBMS, and for those who need more scale and efficiency, a NoSQL database will do the trick.

> It does not matter if an RDBMS can respond to a single request with similar latency to a `#NoSQL` database. What matters is under load the throughput of that RDBMS will be less than half that of the `#NoSQL` database because joins eat CPU like locusts. It's about physics -- [Rick Houlihan - Inventor of DynamoDB](https://twitter.com/houlihan_rick/status/1592511035780763648?ref=highscalability.com)

See my article on [[PostgreSQL Database Cost Estimation]] where I touch on how you can use the [single table design (3)](https://www.datacamp.com/tutorial/single-table-database-design-with-dynamodb) model to drastically decrease the cost of operating a PostgreSQL database cluster.

The single table design isn't without it's draw backs, but it's a great place to start. If you absolutely NEED relationships, then add them with care, not with reckless abandon.

### Fin
I could go on for another hour or so, but I'm done for now, I just had to get this of my chest, and into words. My intent isn't to start another war, but to instead bring some attention to the data modeling topic. I'm not the only one, and I won't be the last, hopefully I'm lending my voice to the chorus.

Where to start learning STD, which is just the beginning of a new data model adventure.
* (1) https://www.gomomento.com/blog/single-table-design-for-dynamodb-the-reality
* (2) https://www.alexdebrie.com/posts/dynamodb-single-table/
* (3) https://emshea.com/post/part-1-dynamodb-single-table-design
* (4) https://www.datacamp.com/tutorial/single-table-database-design-with-dynamodb

