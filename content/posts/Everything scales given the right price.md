---
tags:
  - programming
  - architecture
  - cloud
date: 2023-08-10
---
People will passionately argue that their favorite database or tech stack will scale because company XYZ uses it, and they scale, so we can too! But the truth is, everything scales.

Reddit scales with PostgreSQL, Facebook scales with PHP, YouTube scales with MySQL and the Internal Revenue scales with COBOL, and the list goes on.

It's true, all of these products scale, but it isn’t the database or tech stack that allows them to scale, it’s the solution, the architecture, and design coupled with how much time and money you want to throw at the problem that allows these products to scale.

Reddit has invested heavily in their custom PostgreSQL clustering and sharding system; and they mostly use PostgreSQL as key/value store. YouTube invested years of time and effort into building [Vitess](https://github.com/vitessio/vitess) for MySQL; first internally, then later as an Open Source project. Facebook wrote their own custom PHP to C++ compiler called [HipHop](https://en.wikipedia.org/wiki/HipHop_for_PHP) to scale with PHP, and the IRS just throws money at problems and they magically go away.

If you are asking "Will this tech scale?", the answer will always be "YES, it will (eventually) scale". Instead your question should be, "Does my business model support the time and effort and money it will take to make my chosen solution scale?". If it does not, then you need to evaluate tech stacks until you find one that provides a cost effective means of supporting your business model.

Give me a FoxPro database, millions of dollars, years to build it, and I can make FoxPro scale beyond the wildest dreams of its original writers. (Apologies to anyone too young to know what FoxPro was).

Because the truth is.... given enough time and effort.... anything will scale.

How much time and effort you can afford to make it scale, is up to you.

See [How to Estimate the Cost of Software](https://youtu.be/IxkSlnrRFqc?si=3aU0zOIcr1ttMTRL) and [[You don't know how to Cloud]] or [[The Write Synchronization Problem]]
