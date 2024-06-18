---
tags:
  - design
  - distributed
  - architecture
date: 2024-06-17
---
## Reservation pattern 
The reservation pattern is typically used in place of [transactions in a distributed system](https://www.infoq.com/news/2009/09/reservations/). We've used It along with the [Saga Pattern](https://microservices.io/patterns/data/saga.html) at [Mailgun](https://mailgun.com) to perform transactional operations in our distributed SOA. But... how we got to that point was a happy accident. 

When we first built Mailgun, our first queue system was a library that talked with MongoDB. At some point we realized libraries were more trouble than they are worth in a SOA environment and we built a GRPC based queue service which used the same **Reservation Pattern** the library used to ensure we only delivered an email message once, and only once. What we eventually realized is that we could use the same queue service with the reservation pattern to implement the saga pattern, along with a bunch of other use cases we never really thought about until after we built the queue service.
## Reservation Pattern and Queue How To
The reservation pattern is used to implement an "almost once delivery" queue by ensuring that each message is processed "almost" once and in the order it was received. I say, "almost" because [Exactly Once Delivery (EOD) is theoretically impossible](https://bravenewgeek.com/you-cannot-have-exactly-once-delivery/). HOWEVER, In practice you can achieve AOD or "Almost Once Delivery" which is just EOD with the understanding that you have the occasional duplicate delivery due to some failure of the system.

In our experience, the duplicate delivery rate is very low indeed. When I say "very low" I mean, it has about the same delivery failure rate of whatever your current uptime is. That is to say, message delivery is about as reliable as the system it runs on. If you need additional delivery guarantees you can ensure the messages consumed are idempotent.  Remember, [Distributed systems are all about trade-offs](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)

Here are the key parts of a Reservation Queue:
###### Reservation
When a message is consumed from the queue, the consumer marks the item in the queue as "reserved". When it's marked as reserved for a consumer, the consumer has "claimed" exclusive rights to process that message. For as long as the consumer has that "reservation" no other consumer is allowed to claim that message.

If there are many consumers all attempting to reserve the same item from the queue, then the reservation operation is a race. The first consumer to win the race and mark the item as reserved, gains exclusive rights to process the message. More efficient implementations will queue consumers' reservation requests, such that exclusive right acquisition is on a first come first serve basis, and each request is fulfilled in order it was received. This results in a much more even distribution of messages to consumers.
###### Confirmation
Once the message is processed or delivered successfully, the consumer confirms the reservation by either marking the item in the queue as "complete" or just removing the item from the queue. Thus ensuring that the message will not be processed again.
###### Expiration
If the reserved message is not processed within a specified time, the reservation expires, and the message is released back into the queue to be reserved again.
###### Deferred
Our queue implementations allowed the consumer to voluntarily defer or retry the message, by canceling the reservation and adding the item back to the queue to be offered to some other consumer. Optionally, the defer can specify a future date and time when the message will be re queued.

## Failure Conditions
In our experience the most common failure condition is when the consumer takes longer than expected to process the reserved item, such that the reservation timeout is exceeded. In this scenario the queue implementation will remove reservation and so it is picked up by another consumer. In this way, an item in the queue can be processed more than once. We negate this by increasing the reservation timeout and by carefully implementing our consumers to avoid blocking at any time. This allows us to safely recover from operations which may end up exceeding the reservation timeout and defer the operation instead.

The second most common is a failure to mark an item as "complete" at the end of processing a unit of work. In this scenario the consumer completes its assigned process and the final step of marking the item as "complete" is imminent. However, the item is never marked as complete due to one of the following
* Connectivity to the queue system has been lost
* Catastrophic failure of a server
* Some other unexpected blocking behavior (disk is full, and the service is trying to log a "Processing Complete" message to the logs)
* Someone killed a service with `kill -9`
* Probably some more that we've encountered, but you get the idea.
## Order 
Order is not always required, but is often expected from such systems. Even if the underlying queue implementation is a FIFO, order cannot be guaranteed if multiple consumers pull from the same queue, as consumers may receive ordered items simultaneously, thus losing order. 

In order to be guaranteed, you either need some keyed synchronization system which only allows a consumer to work one job per key, or only allow one consumer for that queue.
## What can you do with it?
* Implement multi-step, retry-able workflows.
* Implement the [Saga Pattern](https://microservices.io/patterns/data/saga.html) for distributed transactions
* Use it as a FIFO queue with ordered delivery of messages.
* Run async background tasks that can retry if failed.
* Schedule jobs to run at a specific time in the future.
## Scaling
Since each queue is backed by a table, the queue service has the [[The Write Synchronization Problem]]. As a result, once we detected a high level of write contention on a table we would create more queues (or slices as we called them) on the database. Each queue or slice was backed by a single MongoDB collection (aka table). In this way, we had a nearly unlimited, scalable, queuing system.

 By spreading write across multiple [MongoDB](https://www.mongodb.com/) collections and clusters. We were able to scale this queue service to handle billions of queued items. 4-5 MongoDB clusters each with one primary and two secondaries (for quorum) each with hundreds of collections (tables) could comfortably handle billions of queued messages a day. 
## Implementations
While that particular system is closed source, I'm working on an Open Source implementation improving upon the lessons learned from building that system.

https://github.com/kapetan-io/querator

