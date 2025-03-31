---
date: 2025-03-30
tags:
  - leadership
  - thoughts
  - architecture
---

Contained within this post is the result of several discussions with [David Dobbins](https://www.linkedin.com/in/dsdobbins/) over the years where he expressed frustration with his inability to articulate our development philosophy concisely to customers and company stakeholders during our time at [Mailgun](https://mailgun.com). We decided on three pillars which would provide our development perspective to those individuals who want to understand how our development culture is different.

To reiterate, the idea here is that we can concisely explain the development philosophy and culture we built and fostered during our time at Mailgun. In short. There are other aspects of software development that are important, but these are the more important aspects of our SDLC.

> If everything is a priority, then nothing is a priority… these are ours

# The Three Pillars
## Product first
Design, coding, testing always starts top down. Interfaces and APIs are the most important part to get right and the product is always more important than code. If we have to choose between improving the product and writing ugly code, we will always choose the product. It means embracing and building services around [[Problem Domains]] and Functional Testing those services.
## Avoid Idealism
Embracing the realities of the environment we work in, instead of the idealization of those environments. We are realistic about constraints, all environments have limitations and even identical environments differ, we embrace this as a reality. This means testing in production and admitting the contract isn't always well defined and will evolve over time. We test the product, not the code. It is insufficient to use mocks for testing, as they are the idealized version of the actual thing being mocked. Instead we endeavor to test with real services and dependencies. An artifact of this is that we prefer functional tests over unit tests. Our focus is on

*   Functional testing; Which is 90% of our testing strategy
*   Good test in production strategies; How we build confidence in change velocity.
*   Observability, for quick resolution of incidents; building confidence in our changes and performance assurances.
## Availability
We build distributed systems with a focus on understanding error states. When building a system, our second question is always “How could this break in production?” We avoid big bangs, we prefer gradual change that we can prove in production, increasing the exposure to change as we gain confidence. We prefer Active/Active availability over Active/Passive.

# The Details
Here we dive into further detail on what the top 3 development aspects mean to us.
### Product 
Product encompasses contract and interface. Most people think of contracts as methods and schemas on either the input or the output of a system, but a product encompasses the entire system. Given this input you will get this output; while this does include the methods and schema it also includes the data within the schema. Put another way, the product is the definition of the system as a whole while the contract is the definition of the interfaces for the individual systems that make up the product as a whole. We use the term product to avoid confusion with the term contract or interface.
### Product over code
You can have the most immaculate code, with the cleanest contracts, but still have a product that doesn't work. The contract and the code serves the product, The product does not serve the code. We love clean, clear, maintainable and consistent code, but not at the expense of our product. This means when performing a Pull Request review, our focus is more on the impact the PR has on the product and less on how idiomatic the code is.

> We believe that if you focus on code, you will get beautiful code, but poor products.

If your focus is to write code, you 

* Focus on idioms 
* Focus on code coverage 
* Focus on code formatting 
* Focus on unit tests 
* Focus on generics / don't repeat yourself. 
* Focus on vertical scaling 

If your focus is to make a product, you 

* Focus on product reliability
* Focus on functional tests
* Focus on functionality and intuitive use
* Focus on support-ability
* Focus on maintainability
* Focus on separation of concerns (Design)
* Focus on horizontal scaling

If you write code focused on the product, all of the other important aspects of our code, maintainability, support-ability, design, etc… will occur naturally. Unmaintainable code rarely results in the best product.

### Top down design 
This is just another aspect of the product first, but it's not just limited to the design of interfaces and contracts. We look at the product as a whole, aka as a complete problem domain to be solved. We design our contract and interfaces first, and ensure that those contracts fulfill the needs of the product. We then design some scenarios of product use and ensure that the contracts that we have designed fulfill those needs. Only then do we begin coding the solution. 

### Avoid Idealism
The reality is that we will almost never fully understand our product. No matter how much time we spend in the design phase of our contracts and interfaces, there will be aspects of our system that are artifacts that we did not expect. This includes networks, operating systems, language choice and the libraries that we use. 

Given two JSON parsing libraries one may accept all unicode characters equally and the other may consider some Unicode characters as invalid. We often may not realize this

until a client gives us a certain combination of Unicode characters and an unexpected result is returned by the product. We may find that a network interface is less reliable or performant for our particular use case than we had previously assumed. This could be true for any number of dependent services and databases. This is also true for environments, IE staging and production are almost never exactly the same, nor do they have the same performance characteristics or load applied to them equally. 

When thinking about the quality of our product we cannot fall into the trap of idealizing the systems, tools and libraries that make up our product. 

### Test the Product, not the code
If we embrace the fact that there are unknowns about our product, we have to set ourselves up for success over the life of the product by investing in flexible and complete code path testing frameworks early in the product life cycle. These frameworks should include tooling which allows us to quickly add new tests that mimic the realities of our code in production. This means we avoid code mocks and dependency injection that present idealized situations, and instead opt for interaction with real or headless dependent services and databases. In this way we exercise as much of the actual code path as production does. When we do this, we find that adding new tests to cover aspects of our contract evolution we discover over the lifetime of the product, to be simple to add. 

### Testing in Production
Testing in production is about reducing risk, finding outliers, and testing performance issues.

No matter how cleverly we craft our testing suite we can never fully reproduce the environment our code will find itself in, while running in production. Typically these types of issues express themselves as performance problems that are not easy to duplicate in a local functional test or staging environment. As such deploying to production is often as much a leap of faith as it is a controlled release of code. Embracing this reality is an important part of increasing the quality of code releases.

A great strategy for testing in production is to run the new code next to the existing code such that some traffic destined for the current release is duplicated and sent to the new release candidate. In this scenario we can safely test the performance impact and functionality of the new release candidate before routing actual traffic to the new release. Even then we can slowly shape some traffic to the new release candidate over a period of time before we fully commit to the new release.

Embracing this method of testing gives developers the freedom to iterate in production with minimal impact on existing systems. Iteration also implies fast deployments and fast rollbacks.

### Functional tests over Unit tests 
A unit test can be an important aspect of our testing toolkit; However, we always prefer to write functional tests over unit tests. This is a reflection of product first, and top down design. If our public interface and product is well tested this gives us freedom to experiment with new internal system configurations and refactoring. Since the bulk of our tests are around the public interface we can freely change the internals of the code, experiment with new ways of delivering product features all while ensuring that we didn't break the product in the process.

### Availability / Scalability
Our systems process over 80,000 emails a second, in order to keep up with the current and future demand we build distributed systems for availability and scalability. This means we avoid contention, synchronization and distributed locking.

We build distributed systems in an [Active/Active](https://www.jscape.com/blog/active-active-vs-active-passive-high-availability-cluster) configuration. Active/Active means all of our systems are actively engaged while in production, we avoid setups where we have an active service, then a standby service ready for failover. (MongoDB and PostgreSQL are notable exceptions)

Building distributed applications has its challenges, but we believe that the availability granted by distributed systems is of greater importance than the challenges they present. This also implies that we focus on horizontal scalability over vertical scalability. Which is generally how you want to scale when running in the cloud.

Availability means we think of all the ways our system can fail, which in turn informs the way we test our product, ensuring we hit all of the common failure modes. Avoiding Idealized situations and always assuming our system, or the systems we depend on will fail, informs many of the development decisions we make.

### Reference
If I had to teach someone how to get to this development philosophy organically over time, then I would recommend these three books.

* [Accelerate book](https://a.co/d/dirgxmF)
* [Teams Topology book](https://a.co/d/7hNrLDb)
* [The SLO book](https://a.co/d/fAT06lm)

### Our Software Manifesto 
* **Product Over Code** There is no direct correlation between Idiomatic code and a great product. You can have idiomatic code but your product still sucks, is terrible to operate, and has terrible up time, stop focusing on code.
* **Functional Over Unit testing** The product fails yet achieve 100% unit test coverage, There is no correlation, stop focusing on unit tests.
* **Everyone tests in production**, except this fact and build your product around this truth. Use feature flags, observability, gradual roll outs, no big bang migrations. Imagine Production is a dragon you don't want to wake, deployment should be slow and careful, and if it looks like the dragon might wake you pause or cancel the deployment, anything to avoid waking the dragon.
* **Immutable testing** If a two line change requires two days of test fixing, you are doing it wrong. Tests should exercise the behavior and not the implementation. Think of your test as immutable, Once you've written the test you can't change it, you can only add new tests. In this way, tests become a long-term asset which improve reliability of your code over the lifetime of the product, and frees you to preform large reactors with high confidence.
