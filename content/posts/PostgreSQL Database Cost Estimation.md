---
date: 2024-06-04
tags:
  - database
  - design
  - cloud
  - systems
---
## Assumptions

This article assumes you are building a product where you have some idea of the "actions" the user will be allowed to perform. Since you know what actions will be performed, you should have some idea of the cardinality, and selection criteria your queries will need in order to present the output to the user - most of the time.

However, if the core idea behind your product is that you **COLLECT ALL THE THINGS** in the hopes that one day, the *things* that you’ve collected will be useful to someone who can craft a suitable query that identifies a yet unidentified revenue stream that the firm will go bonkers about, then this article will be of limited use. In order to estimate, you must have some idea of the use case and queries involved.

Okay, still want to estimate things? Here we go…

## Estimating Traffic
First; estimation is.... an estimation, it's not an exact science. But, the amount of effort you put into the estimation will proportionally reflect in how accurate the estimation will be. You could spend months on an estimation or you could do some napkin math and get to within 25% of the answer. In what follows, I'm going to do my best obi-wan impression and wave my hand a lot. This is because what we are really after is an estimate of the expected operational limit. **Expected Operational Limit** is just a fancy name I use for a Service Level Objective which is the maximum resources our product should consume during normal operation.

For this portion of the estimation, we are not going to guess which part of the week or month the product will be most popular. Nor will we attempt to guess when a spontaneous rush of traffic will occur. As such, I’m intentionally being generous in our estimates so we are not caught unaware.

Therefore, we will assume an average-case even distribution of traffic to our product every day of every week. However, since **spiky** traffic, is **spiky**, we must give ourselves a bit of head room to account for occasional peaks in traffic. If you are doing this for your product, you may want to adjust your estimates with knowledge of your market and target audience.

Let's imagine you need to estimate operational costs of a moderately successful product with an average of 14 Million visitors a month. Just in case you think I'm shooting for the stars here, Amazon receives multiple billions of visitors a month, and stack overflow about 300 million visitors a month, so we're not talking hyper scale here, but a small / midsized business, depending on your cost structure.

#### Calculate concurrent active users
To estimate our database capacity needs, we need to have a sense of what the average concurrent user counts will be during normal operation. Let's see how we go from an estimated 14 million average monthly visitors, to average concurrent users.

- 14 million visitors a month divided by 30 days is `466,666` visitors a day.
- If we estimate 12 hours of normal usage per day: (466,666 visitors / 12 hours) = 38,888 visitors per hour
- If we estimate the average time a user is on our product at 10 minutes, then: 38,888 Visitors Per Hr / (60 Mins / 10 Mins) = 6,481 average concurrent users per hour

That wasn't so bad... right?

#### Calculate user actions while active
Now that we know our average concurrent users per hour, we can estimate the number of actions a user might perform per hour. Let's assume a user will generate an action, which could be a "page view", an "API Call", "add an item to a cart", or "view analytics'', etc... every 10 seconds.

This means, that while our estimated 6,481 concurrent users are accessing our product, we guesstimate that any individual user will interact with our product once every 10 seconds.

You **should** adjust this calculation for each page or individual user action, as the frequency of these actions will vary. For example, an action like viewing or updating a "User Profile" page is likely to occur only once or twice during a user's lifetime. In contrast, logging in to the application, or viewing the dashboard is likely to happen every time they use the application.

For a product where the primary user is another machine making an API request, rather than a human clicking a button, the actions performed per minute or second will be vastly different. For the purposes of this article, let's assume an actual human is using our product, and it's doing so via a web interface of some sort.

So.... for simplicity, we will assume 6,481 users, performing one action, every 10 seconds.

#### Calculating queries per action
Not all actions are equal, but for the purposes of this article, they are. Let's assume every action results in a maximum of 3 queries. Depending on your background, this is either common, or unlikely. But for this article it’s simple, and I like it simple.

With a maximum of 3 queries per action, we can now figure out how many queries a second our DB needs to support.

* 60 Secs Per Min / 1 action every 10 Secs = 6 actions per user, per minute.
* 6 actions Per Min * 60 Mins in an Hr = 360 Actions Per Hr, Per User
* 360 Actions Per Hr * 3 Queries Per Action = 1,080 Queries Per Action, Per Hr
* As calculated previously, 6,481 average concurrent users * 1,080 Queries Per User = 6,999,480 Queries Per Hr
* 6,999,480 / 3600 Secs in an Hour = 1,944 queries a second.

So....our database needs to handle `1,944` queries a second. While that isn't hyper-scale, it's not a personal blog either.

Now comes the fun part. How long does each of those queries take to run, and how much is it going to cost in CPU/IOPS? Answering this depends on a bunch of things. But in my experience it mostly comes down to one thing.

How much work does the database need to perform in order to return the thingies from disk?

All of the following
 * Joins / Merges
 * Sub Selects
 * Aggregations
 * Select or where clauses that don't touch an index. (Despite your best efforts, it happens)
 * Text Search

> [!note]
>  All of these operations require the database to do extra work - regardless of how fast the DB is at doing said work. The more work the DB does, the higher our estimation will be.

I'm focusing on user generated traffic, but don't forget about stuff that happens behind the scenes which is not directly related to user actions. You need to estimate those queries as well and the frequency at which they occur.

## CPU Estimation
Despite modern operating systems giving us the illusion that a single CPU core can perform multiple operations at a time, the truth is, it can't. 

The reason we have that illusion is because the operating system divides up CPU time amongst all the running processes on the machine. In other words, the OS will schedule some CPU time for your database query to perform its work. That scheduled time will continue until the OS decides another thread or process needs some time with the CPU core to do something else.This is a simplified explanation of how CPU scheduling works, but the takeaway is this. A CPU core can only do one thing at a time.

Now that we know a single CPU core can only do one thing at a time, we can use this knowledge to estimate the number of CPUs we need to handle all of our estimated queries per second. It's important to keep in mind this is an estimation to figure out the "expected operational limit" of our CPU requirements. We will use this estimation with the full knowledge that the OS is going to steal away CPU time from the DB during a query to do other OS type thingies like iSCSI, block device stuff, or TCP/IP stack thingies.

Now, before you send me an angry email; yes, I know Hyper-Threading Technology exists, even so, the single CPU estimation technique is good enough to make some meaningful estimates of how many CPUs we will need to accomplish a bit of work. The goal isn't to calculate the exact amount of time the CPU is engaged and not waiting on an I/O operation or doing some other OS thingy. It's just not possible to know what the CPU will be doing at any given moment. The goal is an “estimate”, with all the hand waving that entails. 

With that horribly over simplified explanation in hand. Let's do some CPU estimation!

Since we agreed it will take 3 queries for a user to perform a single action in our app. Let’s assume each of our application queries does some joins and other normal RDBMS stuff, and our application queries are DBA approved for performance. As a result, every query your application makes takes about 53ms on average to do it's work, which sounds pretty good!

With 3 queries per action, and 53ms per query, that means it will take the DB around `159ms` to fetch all the data needed for a single user action - "That doesn't sound too bad" you say, "Databases are amazing" you say!

Since there are `1,000ms` in a second, and all 3 queries together require about `159ms` of CPU time, this means a single CPU core can handle `1,000ms / 159ms = 6.28 actions` or about 6 actions per second `(1,000ms / 53ms = 18.86)` or about 19 queries per second.

So... We are saying that a single vCPU can handle 19 queries a second. If that is true, then we can calculate how many vCPUs we need. Remember, we already calculated that our database needs to perform 1,944 queries a second to handle 14 million visitors a month. Let's divide 1,944 by 19 to get an estimate of how many vCPUs we need to give our database to keep up with the query demand. 1,944 queries a second divided by 19 queries a second means we will need **102 vCPU** to support all those 53ms queries.

Well, we don't actually need 102 CPUs right? We just need a faster CPU and we can reduce the number of CPUs by quite a bit; Well…. MAYBE?!?!? Faster CPUs might help if the query is doing CPU thingies. If the query is returning a ton of data, or is mostly waiting on disk, then a faster CPU isn't going to help much. Instead, we need to understand our IOPS requirements.

## IOPS Estimation
Now that we've got an idea of how much CPU we need, let's talk a little about IOPS. In case you are not familiar, IOPS is *Input/output operations per second* (pronounced eye-ops)

IOPS is the metric cloud operators use to charge for disk access. Inefficient random R/W is penalized with a higher IOPS requirement, and thus an expensive bill. Contrast that with efficient while sequential R/W of large blocks of data is efficient and cost effective. Hopefully you're not building a database from scratch, and your DB is laying data out in a reasonable fashion such that reads will efficiently use IOPs to read and write data. However, since we don't have a ton of insight into how the data is laid out on disk at any given time, any estimate we make, is again... an estimate.

Let’s pretend our product sells stuff to customers, and a main feature of that is to provide customers with a list of products. If we have some idea of what information each product will need. `name`, `description`, `price`, etc. Then we can come up with a row definition and perform some estimations of that data.

```
Product Name             255 Bytes
Product Description	     500 Bytes
SKU                       50 Bytes
Number In Stock            4 Bytes
Urls to Product Images   500 Bytes
List of discount codes   256 Bytes
List of categories       256 Bytes
Price                      4 Bytes
```

If we add up the max number of bytes in a single table row we get around 1,825 bytes per row. If the default is to show a customer 10 products per page. Then `1,825 bytes per row * 10 products = 18,250 max bytes per page`. Now we divide the bytes per page by 4,000 byte block size and you get `18,250 / 4,000 = 4.56 Reads` or 5 IOP's to read a single 10 product listing from the disk.

So if all 1,944 queries are listing 10 products – probably not the case, but I'm over simplifying here --  then that means we need at most `1,944 queries * 5 IOPS per query = 9,720 IOPs`. This is assuming that all your data is on disk and not already cached in memory. This estimate doesn't include reading an index from disk, or even include read/write of temporary tables that might be required when performing a JOIN. 

The default block size of I/O also affects the number of IOPS used. The block size could be adjusted depending on your OS and DB support. It might be useful to use bigger blocks if you are loading and storing a lot of data.

> [!note]
> Typical default block size is 4KB for both Linux and Windows Operating Systems. But different DB's save different block sizes into memory. For example, PostgreSQL will save 8KB blocks in memory by default and MySQL uses 16KB blocks by default.

`<rant>` different databases are designed to be IOPS efficient for different workloads. Kafka -- yes, Kafka can be considered a database -- is very good at laying data sequentially on disk, which makes it a very fast and IOP effective way to stream data. Yes, you could stream data using your favorite Database X,Y,Z. - I'm looking at you; [Mr, use postgres for everything](https://www.amazingcto.com/postgres-for-everything/) - But, it's not going to be an optimal use of the hardware, which translates into a higher estimate and unnecessary costs. When we were building Mailgun, there were a few times where we used a database for a workload it was not suitable for, and as we scaled we ended up spending more money on it than we expected. In one case, it ended up being something like 30% of our infra bill! You really want to use the correct DB for the correct workload. `</rant>`

If your data is only written and rarely ever read from disk, then estimating IOPS is much easier. However, if your data is in a RDBMS and you expect to perform JOINs or SubSelects then your estimate may also include writing and reading of temporary tables. You should also expect additional reads from tables you join or select from; which will impact our max IOPS estimate and cost. If however, your entire database can fit into memory, and you have plenty of memory for temporary join tables in memory, then you can lower your estimate by quite a bit. There is no science here, every DB and dataset is different.

To recap, we are not looking for an exact estimation, but an "expected operational limit", which becomes part of our SLI that will help us decide what we should purchase.

We calculate our worst case scenario by counting the actual data we expect to be written or read from, then adjust your estimate based on the particulars of the database and situation. For example, I'm using PostgreSQL for this estimate, and I know the entire dataset should fit into memory. So I take my 9,720 IOPs estimate and divide by half to get a max IOPS of 4,860 during normal operation. 

Armed with this max IOPS SLI, when we go to production; If any of our production monitoring reports IOPS above that estimate, we should set an alarm to be notified! The max IOPS we just calculated becomes a part of our SLI, and will give us an early warning that our system is exceeding the expected operational limits; see how that works?

### A few notes before moving on
**First** In the real world we have these things called caches, and those things will greatly decrease the number of queries a DB needs to support. If you want, you can adjust the CPU/IOPS down by the hit ratio you expect. I prefer using [GroupCache](https://github.com/groupcache/groupcache-go) for my cache implementation as it is super fast, and has built-in thundering herd mitigation, but I’m biased.

**Second** I completely glossed over any consideration of writes vs reads. Writes are generally slower than reads depending on the type of database you are using. So you could break up the estimation by a ratio of reads to writes. If you are an e-commerce site, then likely your read to write ratio is something like 50 to 1 or higher. You should include that in your query cost estimation. 

## Pricing our DB Cluster
Okay, here is what we have so far. In order to support a product with 14 million visitors a month with the following assumptions:
- A user will perform an action every 10 seconds
- Each action will require at worst 3 queries to complete the action
- Each query should take around 66ms each

The DB estimation is:
- DB needs to support 1,944 queries a second
- DB needs about 4,860 IOPS max
- DB needs about 102 vCPUs max

Now that we are armed with an estimate of CPU and IOPS, let's build our database cluster in the GCP estimator and see what our estimated bill might be. Let's assume we only want the minimum fault tolerance, and we are planning to use the world's most popular rock solid open source database, vanilla PostgreSQL!

- We will need 2 clusters
- Each cluster will need 3 nodes
- Each node will need roughly 54 CPU's (So 64 CPU per instance)
- Each node will need roughly 25,000 IOPS (to support replication & backups in addition to queries)

> [!note]
> We need 2 clusters because of the number of CPUs we require. Not every GCP machine family supports more than 64 CPUs on a single GCP instance.
>
> Also, because we have two clusters, our application will need to implement some sort of sharding strategy which we will either have to implement ourselves, or is built into, or bolted on to our database.

Using the GCP pricing calculator, I found the following price estimates as of April 2024
##### 144,000 a year
With 6 balanced performance nodes of type `n2-standard-64` with 64 CPUs and 256 GB of RAM, including a `Zonal SSD PD of 6,000 GiB` will run you about **12,000** dollars a month, which is **144,000** dollars a year.

The cheapest part of that configuration is the SSD Persistent Disk which runs about 1,000 dollars a month. Now, let's change it up a bit, this time with a lower CPU count, faster CPU's and more memory. Since we are using faster CPUs we can drop the CPU count down from 64 to 32.
##### 320,000 a year
With 6 memory optimized M3's of type `m3-ultramem-32` that comes with 32 CPUs and 976GB of RAM including a `Zonal SSD PD of 6,000 Gib` will run you about **26,679.00** dollars a month, which is **320,148.00** a year.

So depending on your background, experience, and where you land on the "I know what we pay for infrastructure" ladder. You are either thinking, "That price isn't too bad, I've seen worse", or maybe, "ZOMG, that's more expensive than I thought!". If you think this estimate is too high for 14 million visitors a month, you could be correct; remember, we overestimated 3 queries per action and didn’t include caches in our estimate.

The truth is, the costs involved in operating such a setup may be covered by the price your firm is charging for services rendered. The margins involved in absorbing such costs will vary from product to product. However, even if your firm's pricing structure supports such an infrastructure configuration. Imagine how much more competitive your product and pricing could be if you were to reduce that infrastructure footprint.

## How fast is fast?
Okay, So let’s imagine our estimate tells us we are a bit over budget. What can we do to improve our cost effectiveness? 

To do this, let's have some fun with PostgreSQL! PostgreSQL comes with a super awesome `pgbench` benchmarking tool to test your own queries - What else did you expect from the world's best open source database? 😜

Here is a link to a [Github Repo](https://github.com/thrawn01/db-cost-estimation) with all the schema definitions and SQL queries I'm going to be using. First up, is my first draft at a SQL query to fetch a page of products customers can browse.

```sql
SELECT p.*,  
   	c.name                                    	AS category_name,  
   	array_to_string(array_agg(pi.image_url), ',') AS image_urls,  
   	(SELECT SUM(i.in_stock)  
    	FROM inventory i  
    	WHERE i.product_id = p.id)               	AS in_stock,  
   	(SELECT s.back_order_count  
    	FROM suppliers s  
    	WHERE s.id = (SELECT i.supplier_id  
                  	FROM inventory i  
                  	WHERE i.product_id = p.id  
                  	LIMIT 1))                  	AS back_order_count,  
   	array_to_string(array_agg(dc.name), ',')  	AS discount_codes  
FROM products p  
     	JOIN  
 	categories c ON p.id = c.product_id  
     	JOIN  
 	product_images pi ON p.id = pi.product_id  
     	JOIN  
 	inventory i ON p.id = i.product_id  
     	JOIN  
 	discount_codes dc ON p.id = dc.product_id  
GROUP BY p.id, c.name  
OFFSET 0 LIMIT 10;
```

Yes, I know; yuck….. or beautiful?.... depending on what planet you're from? The DBA or developer goal here was to normalize the data in order for our inventory, back orders and discounts to reflect in our product page automagically. But, as we will see, this magic has a cost.

First we want to grab a server with some basic stuff. I'm working with a [n2d](https://cloud.google.com/compute/docs/general-purpose-machines#n2d_machines) server with 8 CPU's and 32GB of RAM and attached "Balanced Persistent Disk" mounted on `/mnt/data`.  

Now, let's create our tables
```bash
$ psql -f complex-schema.sql
```

Now let's generate some data  with `pgbench`
```bash
$ pgbench --client=8 --jobs=8 --time=100 --no-vacuum \
  --file=complex-pgbench-propagate.sql
pgbench (15.6 (Debian 15.6-0+deb12u1))
transaction type: complex-pgbench-propagate.sql
scaling factor: 1
query mode: simple
number of clients: 8
number of threads: 8
maximum number of tries: 1
duration: 100 s
number of transactions actually processed: 236398
number of failed transactions: 0 (0.000%)
latency average = 3.384 ms
initial connection time = 7.085 ms
tps = 2364.070402 (without initial connection time)
```

Since we are using PostgreSQL let's do some basic optimization stuff so we get some decent performance. First you want to get an idea of how big your data on disk is after loading the data, you can do that with  the following

```bash
$ du -shc /mnt/data/base
716M	/mnt/data/base
716M	total
```

With this information you want to ensure PostgreSQL has enough memory to load all that delicious data into memory. We need to change the following values in `postgresql.conf` to the appropriate settings for your dataset.

```
data_directory = '/mnt/data'
shared_buffers = 8GB
work_mem = 1GB
effective_cache_size = 1GB
```

Now let's restart PostgreSQL and run our tests

```bash
$ pgbench --client=8 --jobs=1 --time=30 --no-vacuum --file=complex-pgbench-test.sql
pgbench (15.6 (Debian 15.6-0+deb12u1))
transaction type: complex-pgbench-test.sql
scaling factor: 1
query mode: simple
number of clients: 8
number of threads: 1
maximum number of tries: 1
duration: 30 s
number of transactions actually processed: 61
number of failed transactions: 0 (0.000%)
latency average = 4624.686 ms
initial connection time = 19.834 ms
tps = 1.729847 (without initial connection time)
```

Woh, that's pretty bad, 1.729 transactions per second with an average latency of `4624.686 ms` ! If you run it for 15 minutes (900 seconds), you still get about the same results.

Now let’s simplify the query by removing the sub selects

```bash
$ pgbench --client=8 --jobs=1 --time=30 --no-vacuum --file=complex-only-joins.sql
pgbench (15.6 (Debian 15.6-0+deb12u1))
transaction type: complex-only-joins.sql
scaling factor: 1
query mode: simple
number of clients: 8
number of threads: 1
maximum number of tries: 1
duration: 30 s
number of transactions actually processed: 2527
number of failed transactions: 0 (0.000%)
latency average = 96.233 ms
initial connection time = 17.541 ms
tps = 83.131388 (without initial connection time)
```

That’s more like it! `96.233 ms` is much more scalable than, whatever that monstrosity we had before was doing.

The general idea here is this… “The less work the DB has to do, the faster we get our data”. Of course, there are several things you can do to improve the individual performance of a query that doesn’t involve simplifying the data. Most of those things will vary depending on the database you are using. However, the universal way to improve query performance regardless of the database, is to simplify data and thereby the query. 

So, what if we put the data on disk in the same form we will present it to the consumer? Then all the database needs to do is retrieve the data. What if we lay out all of our data in a single table like so.

```sql
CREATE TABLE products
(
	id         	SERIAL PRIMARY KEY,
	name       	VARCHAR(255)   NOT NULL,
	description	TEXT,
	sku        	VARCHAR(50)	NOT NULL,
	on_back_order  DECIMAL(10, 2) NOT NULL,
	in_stock   	DECIMAL(10, 2) NOT NULL,
	image_urls 	VARCHAR(500)   NOT NULL,
	discount_codes VARCHAR(356)   NOT NULL,
	categories 	VARCHAR(356)   NOT NULL,
	price      	DECIMAL(10, 2) NOT NULL,
	cost       	DECIMAL(10, 2) NOT NULL,
	weight     	DECIMAL(10, 2),
	length     	DECIMAL(10, 2),
	width      	DECIMAL(10, 2),
	height     	DECIMAL(10, 2),
	is_available   BOOLEAN    	NOT NULL DEFAULT FALSE,
	created_at 	TIMESTAMP  	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at 	TIMESTAMP  	NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Okay, but if we denormalize our data, you may be wondering how we plan on keeping that data up to date and ensuring referential integrity now that we no longer have any relationships between tables? If you are curious, we will tackle that subject in the next article, but for now, let's move forward.

Let's run `pgbench` with the new schema and query.

```
$ cat simple-page-by-offset.sql
\set aoffset random(1, 200000)

SELECT name, description, sku, on_back_order, in_stock, image_urls,
	discount_codes, categories, price, weight,
   	length, width, height, is_available 
FROM products OFFSET :aoffset LIMIT 10;
  	 
$ pgbench --client=8 --jobs=1 --time=30 --no-vacuum --file=simple-page-by-offset.sql
pgbench (15.6 (Debian 15.6-0+deb12u1))
transaction type: simple-page-by-offset.sql
scaling factor: 1
query mode: simple
number of clients: 8
number of threads: 1
maximum number of tries: 1
duration: 30 s
number of transactions actually processed: 4521
number of failed transactions: 0 (0.000%)
latency average = 53.176 ms
initial connection time = 28.445 ms
tps = 150.443904 (without initial connection time)
```

With this much simplified schema we average `53 ms` per query and 150 transactions per second, very nice!

#### Comparing our estimate with our benchmark
Hurm…. 53 ms; where have I seen that before? Oh Yes, we imagined a 53ms query to base our estimations on. I did this so we could compare our CPU estimation to a real world benchmark later on. So… Now that we have some actual benchmark data, how did our estimation do? 

Because `pgbench` gives us the actual transactions per second we achieved during the test, we can compare what `pgbench` thinks the TPS will be with the current number of clients per CPU requested. 

```
tps = 150.443904 (without initial connection time)
``` 

Since our test machine has 8 vCPUs let’s divide `150 transactions a second / 8 vCPUs = 18.75` This means each CPU is able to process about 18.75 queries per second. So our estimation of 19 queries per second per CPU was pretty accurate! 

> [!note]
> I’m running `pgbench` on the same machine as the database, the outcome of tests will be
different if you run `pgbench` on a different machine, as the machine is running both the database and the benchmark tool.

#### Optimize Prime
Based on past experience with PostgreSQL, we can get some crazy speed if we know how. Let's go faster!

By performing an `explain analyze` on this query we discover that `OFFSET` performs a sequence scan on the table. If we change it to use the `id` for paging, the results are even better.

```
$ cat simple-page-by-id.sql
\set aoffset random(1, 2000000)

SELECT name, description, sku, on_back_order, in_stock, image_urls, 
	discount_codes, categories, price, weight,  
  	length, width, height, is_available FROM products 
WHERE id > :aoffset ORDER by id LIMIT 10;

$ pgbench --client=8 --jobs=1 --time=30 --no-vacuum --file=simple-page-by-id.sql
pgbench (15.6 (Debian 15.6-0+deb12u1))
transaction type: simple-page-by-id.sql
scaling factor: 1
query mode: simple
number of clients: 8
number of threads: 1
maximum number of tries: 1
duration: 30 s
number of transactions actually processed: 1175582
number of failed transactions: 0 (0.000%)
latency average = 0.204 ms
initial connection time = 20.121 ms
tps = 39212.065573 (without initial connection time)
```

Now that our query is using the primary index, we average `0.204 ms` per query which gives us **39,212 transactions per second**. 

WOW, such improvement, much speed, super effective!

To reiterate, the basic take away from this section is. "The simpler the data and the query, the faster the database can access it". To put it a different way; “Just because the database CAN do something, doesn't mean you SHOULD do it”. Aggregations, joins, subselects, are all amazing features and have their uses. However, if you can avoid using them, you should.

> Just because you could, doesn't mean that you should!

##### 13,200 a year
Now that we achieved `0.204 ms` let’s price a cluster again. Remember, such a simple query gives us around `39,212` transactions a second sustained, which is way above our 1,944 requirement.

So, with 3 balanced performance nodes to form a single cluster, using type `n2d-standard-8` that comes with 8 CPUs and 32 GB RAM including attached `Zonal SSD PD of 3,000 Gib` will run you about 1,102.00 per month, which is 13,200.00 a year. 

I could even price a cheaper cluster than that, since our estimate is for 1,944 queries a second, and even if every query took 1ms to complete, it would mean we only need 2 vCPUs. But going cheaper would mean sacrificing memory.
## Takeaways
Estimation is a great way to get a holistic view of the costs involved in building a product before you commit months or even years of work into a solution. Assumptions can be challenged, and profit margins estimated. The more often you perform these estimation exercises the better you will be at guesstimating what solutions will work and which won’t, without having the pain of a refactor once the solution is in production.

###### Simple is better
To a good developer, the database is a way of avoiding work. But as we’ve seen, the more you put on the database, the more expensive your fixed cost becomes. The key then is to develop strategies which encourage developers to offload computational load from the database and back onto the application. Once that is done, you can scale up and down the expensive computational work on demand, thus taking full advantage of what the cloud has to offer. 

I’ll be talking about what these strategies are in my next post.

###### Legacy databases are fixed costs
Legacy databases are an expensive way to solve a computational problem because most of them are static in nature. What I mean is; Most traditional RDBMS clusters do not scale up or down in response to spontaneous increases or reductions in traffic. This is the unfortunate truth of using a legacy -- Yes, I’m calling PostgreSQL "legacy" – database in the cloud. Such databases were never designed to take advantage of the cloud's ability to scale up or down dynamically. The take away from this should be obvious, the less work the database must do, the lower your fixed cost database will be.

###### Hosted Solutions
The estimation techniques we discussed are also a great way to get a handle on expected costs when considering a hosted database vs a static configuration you manage yourself. The ability to estimate the costs involved in using a fully hosted solution before committing is so important. 

If you do find the hosted solution is of great benefit to your product, the estimation you performed should form the basis of your SLI. You can then monitor that SLI in production. If at any time the actual CPU or IOPs estimate exceeds your SLI, then you should be alerted immediately. Doing so you can avoid any unhappy surprises in your cloud bill. Additionally, SLI and SLO's can be an early warning system that something is really wrong. If for instance, you find that your production workload suddenly needs 2x the resources to perform the same work, you know something is very wrong.

## Parting Words
I hope you enjoyed this little tour through the exciting world of estimation. If you want to learn more about estimating, I would highly recommend https://github.com/sirupsen/napkin-math and the associated SRECON presentation. Both the repo and presentation are amazing, and inspired me to write this article.

I’m working on a follow up article where we talk about strategies I’ve used to reduce the burden we place on the DB, thus resulting in a lower cost of ownership. In the meantime, you can read my other rant on efficient use of cloud called [[You don't know how to Cloud]]
