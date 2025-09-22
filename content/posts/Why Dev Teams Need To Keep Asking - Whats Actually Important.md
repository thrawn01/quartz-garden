---
title: Why Dev Teams Need To Keep Asking - Whats Actually Important
date: 2025-09-12
slug: importance-matters
tags:
  - programming
  - testing
  - architecture
  - systems
  - teams
  - thoughts
draft: false
---

First, let's talk about toilets.

What's the most important thing about a toilet? The handle? The seat? The porcelain?

As Anton used to say "A toilet is worthless if it doesn't flush waste away". The most important thing about a toilet isn't the toilet itself. It's the sewer system. The water treatment plant. The waste management infrastructure. Without these, you just have a fancy chair with a hole in it.

It doesn't matter if the seat is gold-plated. Nobody will use a toilet that doesn't function.

This same principle -- that functionality matters more than the product -- applies directly to software. Software products are the same. **THE CODE ISN'T THE PRODUCT.** The functionality -- the business value that customers actually pay for -- is the product, that's what matters. Just like the toilet's value isn't in its materials, but in waste removal, your product's value isn't in how it's built but in what it accomplishes.

The toilet analogy is great, because it illustrates that it's easy to get distracted, it's easy to lose focus on what's important, it's easy to forget WHAT you are building. Without realizing it you start focusing on things and worrying about things that don't matter. New hires will distract you because their most pressing issue seems most important to them. This issue only compounds as you grow.

So how do you stay focused on what actually matters? How do you even KNOW what matters? When you read books on this subject, the good ones all say the same thing "focus on product". They're absolutely right, but that begs the question: what PART of the "product" do you focus on?

## The Framework
This is a framework I developed to keep me focused at [Mailgun](https://mailgun.com). I brought this up all the time - people would moan when they saw me bring up the diagram. It's grown and changed over time, but the important parts remain the same.

![[importance.png|800]]

Product sits at the top, yes. But product is nothing without....

### Functionality
The actual business value customers pay for. If we can't deliver that value, why are we even here?
### Operations
Your product can be functionally perfect, but if it's slow, if it's not available, what value are customers getting? Zero. Especially as a SaaS product. If you can't operate it, scale it, keep it running, the best code in the world is worthless. Operations, in another word: resilient, and "resilience engineering" in two words: anticipate surprise.
### Testing
How do we know we're delivering functionality we promised customers? Unit tests can't tell you if the product is functional, code coverage can't tell you either. I've seen products with 100% code coverage THAT DIDN'T WORK. 

Our customers don't care if we have a thousand unit tests. They care that our service works. You need to test the actual functionality. You could have zero unit tests as long as you're testing that your service delivers what customers pay for, that's what matters.
### Customer Data
Here's a question I ask developers: what's more important, the data or the database? Most get it wrong, thinking it's a chicken and egg problem. It's not. 

We acquired a company that was a Postgres shop. They had a table getting hundreds of thousands of status updates every minute, which caused vacuum problems -- a common issue with Postgres. As their write pressure increased, they ran out of transaction IDs because vacuums couldn't keep up. The database crashed, and they had an outage.

One SRE's solution was to upgrade Postgres to a new version, because it had better vacuuming. However, this upgrade caused another outage because their services needed updates for compatibility. Worse yet, the upgrade didn't actually solve the issue.

Do your customers care what version of Postgres you run? Do they care if you run Postgres, MySQL, or MongoDB? Of course not, but they DO care that their data is valid, secure, and available. The data and how it's structured is always more important than the database.

I can make MySQL scale, I can make PostgreSQL scale, I can make MongoDB scale, WHY? because I know that data modeling and schema is the single most important factor in your ability to scale. The database doesn't make you scale, its how you use the database that enables you to scale. So Data and Schema are more important than the database, any day of the week.

So how do you apply this framework when you're actually writing code? The same order of importance holds: focus on what delivers customer value by prioritizing functionality over implementation.
## Code Architecture
What's more important, the interface or the implementation?

The interface is the public API through which your code provides its functionality. If we are applying the importance framework to code, then the interface, and the functionality it provides is the most important thing. If functionality is most important, then we should spend extra time designing the interface, making sure it's intuitive, scalable, or flexible if that is a requirement. See [The Power of an Interface for Performance](https://www.youtube.com/watch?v=yKgfk8lTQuE)

The IMPLEMENTATION of the interface is less important, provided we get the interface right. If you get the interface right, you can refactor the implementation to your hearts content, while providing the same functionality. 

### Testing
Apply this same lesson to testing, if the interface is the most important part of the code, then where should our test focus? The interface! Tests should primarily exercise the functionality! Even if the tests cheat a little bit and fiddle with the database setting up different scenarios, or preform dependency injection to simulate failures, you are STILL testing the interface, even if your test setup is fiddling with non interface code to do it.

This implies testing private methods -- testing the implementation -- is less important than your "functional tests" which test the functionality of the interface, ensuring that your interface provides the value it promised. (You can also call this behavioral testing, but it's essentially the same, the behavior, or the functionality of the interface is of paramount importance) See [[Never test Private methods]]

This line of thinking also impacts how you think about mocks. Is it better to use a mock or not? If you are testing the "functionality" of the interface, then you want to ensure your test simulates production as closely as possible. Production is NOT going to be running with a mock, thus it's NOT going to respond with the exact response as your carefully crafted mock. If you're truly testing functionality, spinning up an actual database and external dependencies in a container, adding the supporting data, and then exercising your functionality is more important than any mocks you might use. The importance framework tells us that running tests in as similar an environment as production is more important than having our completely mocked test suite run in 100ms.

> To be clear, I'm not saying you should never use Mocks. In fact mocking external dependencies is a great way to isolate a test within the context of the problem you are solving. The point is, this is the exception, not the rule. You want to include as MUCH of the real world in your tests as possible without causing you undue pain.

Applying the importance framework to code forces you to some interesting conclusions:
- **Contract First Development makes a lot more sense.** When you define your interface contract before implementation, you're forced to think about what functionality you're actually promising to deliver, and if your contract meets your functional requirements.
- **Code Architecture is more impactful than idiom and style.** A well-architected system is easier to understand, debug, and maintain than code that only has style and idiom enforcement.
- **Time spent on interface design pays dividends over the life of the product.** Every hour spent getting the interface right can save endless hours of frustration, refactoring and maintenance. It's better to spend a little time upfront getting the interface right, than spend months fixing it later.
- **You become a student of cohesion**, when to apply tight coupling and loose coupling become second nature. You learn that tight coupling between modules in the same problem domain creates clarity, while loose coupling between modules outside of that problem domain creates flexibility—and knowing when to use each becomes instinctive.
- **You spend less time building V2 of your product, and more time refining V1** which brings many untold benefits. Instead of throwing away your first version, you can evolve it because the interface was right from the start—saving months of duplicate effort.
- **You design your interface to be functional and testable**, which steers you toward more intuitive designs.
- **If your interface is well tested, you can completely refactor the implementation** with high confidence you didn't break anything. Thus improving the reliability of your product over time, which increases team velocity.

### Code Reviews
The importance framework applies to both code AND code reviews. When reviewing a PR, think about what's important.

**Testing & Functionality**: Does the PR include automated tests which provide functional proof the change works? Do the test cases cover good and bad paths? 

**Operations**: Think about the failure conditions. How does it fail? In what ways could it fail? Is this change supportable? How close is the test to what actually runs in production?

**Customer Data**: Is this change going to dump data into a table that never gets cleaned up? Think about the schema—is it scalable? Are we using an int as a primary key that will overflow? etc... etc...

Beyond that, consider WHY we are making the change, Does this change need to be made? [The best code is no code, and is the best way to write secure and reliable applications](https://github.com/kelseyhightower/nocode)

Are we spending hours or days arguing about idioms or code style in our PRs? Is that as important as functional testing, code architecture, data, and supportability? 
## Conclusion
There's much more that could be said on this topic, but I'll wrap it up here to keep this post short.

You can apply the importance framework to just about anything you do. Constantly question whether you're working on the most important thing. Focus on the four critical pillars before worrying about anything else, then work your way down the importance hierarchy.

Develop your own Importance Framework. Start with the four critical pillars, then collaborate with your team to define what matters most for your specific product and goals. Reference the framework you develop continuously during planning and development to maintain focus.

Focus on the pipes first, make the porcelain shine later..
