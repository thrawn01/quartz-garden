---
tags:
  - design
  - distributed
  - architecture
date: 2024-06-17
---
## Reservation pattern 
The reservation pattern is typically used in place of [transactions in a distributed system](https://www.infoq.com/news/2009/09/reservations/). We've used It along with the [Saga Pattern](https://microservices.io/patterns/data/saga.html)to preform transactional operations in distributed systems. What we eventually realized is that we can implement the saga pattern more efficiently if we instead used the Reservation pattern with a queue and then used to Saga Pattern with our queue implementation.

## Reservation Pattern and Queue
The reservation pattern can be used to implement an "exactly once delivery" queue by ensuring that each message is processed exactly once and in the order it was received. Although [perfect EOD is theoretically impossible](https://bravenewgeek.com/you-cannot-have-exactly-once-delivery/). In practice you can achieve EOD with very low rate of duplicate delivery under normal conditions. If you need additional delivery guarantees you can ensure the work consumed is idempotent. For our use case which is an email delivery queue, very low rates of duplicate delivery were acceptable. Remember, [Distributed systems are all about trade-offs](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/)

Here are the key steps to achieve this:
###### Reservation
When a message is consumed from the queue, the consumer marks the item in the queue as "reserved". If there are many consumers all attempting to reserve items from the queue, then reservation could be a race and the reservation must be an atomic operation. The first consumer to win the race and mark the item as reserved, gains exclusive rights to process the item. More efficient implementations will queue consumers such that exclusive right acquisition is on a first come first serve basis in order to ensure even distribution of queue items.
###### Expiration
If the reserved message is not processed within a specified time, the reservation expires, and the message is released back into the queue to be reserved again.
###### Confirmation
Once the message is processed successfully, the consumer confirms the reservation, ensuring that the message will not be processed again.
###### Deferred
Our queue implementations allowed the consumer to voluntarily defer or retry the message, by cancelling the reservation and adding the item back to the queue to be offered to some other consumer. Optionally, the defer can specify a future date and time when the message will be re queued.

## Order 
Order is not always required, but is often expected from such systems. Even if the underlying queue implementation is a FIFO, order cannot be guaranteed if multiple consumers pull from the same queue, as consumers may receive ordered items simultaneously, thus losing order. 

An example is a FIFO queue which contains a list of async jobs which must be completed in order. IE: There is a "send list" job followed by a "delete list" job. In such a scenario you expect the "send list" job to run and complete first, then the "delete list" job deletes the list that was just sent. Allowing these items to run out of order would be disastrous.

For order to be guaranteed, you either need some keyed synchronization system which only allows a consumer to work one job per key, or only allow one consumer for that queue.

## Implementations
We built a system like this at [Mailgun](https://mailgun.com) and scaled it to tens of billions of queued items a day by spreading queued items across multiple [MongoDB](https://www.mongodb.com/) collections (we called them slices) and database clusters. A collection of 4 clusters with 3 nodes and hundreds of collections each could comfortably handle billions of queued messages a day. Although we never took official counts, I would estimate we had a duplicate rate of one in a few trillion.

While that particular system is closed source, I'm working on an Open Source implementation improving upon the lessons learned from building that system.

https://github.com/kapetan-io/querator

