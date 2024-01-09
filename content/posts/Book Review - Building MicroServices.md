---
tags:
  - book
  - cloud
date: 2015-06-16T14:57:19Z
title: Book Review - Building MicroServices
---
I picked up pdf copy of [Sam Newman's](http://samnewman.io) book, [Building Microservices](http://info.thoughtworks.com/building-microservices-book).
Since I've had some experience with SOA and microservices I thought I'd take a look.
I'm really glad that I did, it's a great book! The following are some quotes
from the book and my thoughts on the subject.

**"With micro-services, we can make a change to a single
service and deploy it independently of the rest of the
system.”** — If multiple services rely upon a single
service, you can’t just change it inside a vacuum, deploy it
and expect dependent systems to never have problems.

<!--more-->
Instead what you might be creating is a deployment architecture where all your
micro services must sync their releases and testing together across multiple
teams. This requires non trivial cross team collaboration. This indicates a
need for oversight management controls and testing to ensure releases happen
consistently and without incident.

My take on how this could be avoided is by following one
simple rule. NEVER change a currently deployed API. Once an
API has been deployed NEVER make disruptive changes, additive
changes can and should be allowed, but previous functionality
should always be preserved. (See the Versioning chapter in
the book for more ideas) 

One other remedy to avoiding the oversight nightmare is each
service needs a comprehensive suite of performance and
contract functional tests. However, even with these tests
mistakes will be made and contingency plans (such as
rollback) must be put into place when deploying. Dependent
services MUST be informed of a pending release and given a
chance to test against the new release before going live.

**"So you should instead think of micro-services as a
specific approach for SOA in the same way that XP or Scrum
are specific approaches for Agile software development.”** —
This is a fantastic way of thinking about micro-services.
Just because waterfall made your job a nightmare doesn’t mean
you stop developing software. You just need a new perspective
on the methodology of developing software. Apply this to SOA
and micro-services and altho things look the same the result
can be very different.

**"I should call out that micro-services are no free lunch or
silver bullet, and make for a bad choice as a golden hammer.
They have all the associated complexities of distributed
systems, and while we have learned a lot about how to manage
distributed systems well (which we’ll discuss throughout the
book) it is still hard. If you’re coming from a monolithic
system point of view, you’ll have to get much better at
handling deployment, testing, and monitoring to unlock the
benefits we’ve covered so far. You’ll also need to think
differently about how you scale your systems and ensure that
they are resilient. Don’t also be surprised if things like
distributed transactions or CAP theorem start giving you
headaches, either!”** — So this is why I REALLY like this
book, it doesn’t sugar coat the problems. Micro-service
architecture brings many advantages, but don’t imagine you
can make any design decision now and think it won’t come
around a bite you in the butt a few months or years from now.
No joke, Distributed systems are HARD but the alternative
is…. just as hard or worse. The name of the game is
de-coupling, and even if you decide to make a domain specific
monolithic service you should decouple within the service to
avoid many of the problems the book calls out around
monolithic code bases.

One of my favorite chapters is **Orchestration Versus
Choreography**. The author does a marvelous job of laying
out the merits and pit falls of each. But my interest in this
topic comes from years of being surprised at how
different philosophies and personal strengths influence how
designers approach problems. Orchestration implies a more
authoritative philosophy while choreography implies a more
democratic philosophy. I’ve have many heated discussions in
the past about architectural design not because of technical
merit, but because of a mental block a philosophy has on an
individual.

This personal philosophy also spill’s over into how your
teams think about solving their part of a larger problem.
Careful consideration must be made when orchestrating
processes that cross many micro-services and thus different
teams, which all might solve problems differently.

This book is sprinkled tons of insightful gems of knowledge
through out, which makes the book fun and interesting to
read. This flies in the face of the notorious SOA
conglomerate of books which often leave the reader sleepy and
bored out of this mind. In contrast this book is a no
nonsense implementers guide to doing micro-services the right
way.

If I had one critique I would say the lack of detail related
to data joins is unfortunate. One of the achilles heels of
distributed data is having to join data sets across a
network. The book makes small mention of this problem under
the **Scaling for Writes** subheading, where he describes
setting up an additional data store where the joined data is
duplicated and then queried from. However I feel this is such
a reoccurring problem that it deserves it’s own subheading if
not it’s own chapter.

Despite this minor short coming the book is very solid and if
your interested in bringing micro-services to your
organization or are starting green field. This is a great
book to have, the author demonstrates a deep knowledge of the
benefits and problems and the many common solutions designers
and developers make when building services.
