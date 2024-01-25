---
date: 2022-10-25
tags:
  - architecture
  - programming
  - education
---
> [!note]
> This is a continuation of a previous post entitled [[Anatomy Of A Product]] I recommend reading that first.

Our customers are now asking us to support forwarding a single email to multiple recipients, in addition our parent company wants us to support forwarding emails via HTTP Webhook. While we could probably make this work as an additive change to our current v1 API, let's introduce this as v2 of the forwarding product to see how our mental model might evolve to handle new versions of things.

```json
POST /v2/forwards
{
	"email": "from@example.com",
	"forward": {
		"recipients": [
			"forward1@email.com",
			"forward2@email.com",
		],
		"webhook": "https://email.com/webhook",
	}
}
GET /v2/forwards{email}
DELETE /v2/forwards{email}
POST /v2/forwards/import/csv
```

Here is the new model

![[Anatomy Of A Product - Version 2.png]]

The most complex of the changes is probably in the `ForwardEvaluator` as it now must query both the V1 and V2 rule stores for rules to match. We want this duplicate behavior because it’s possible customers have rules in both versions of the product, and both should continue to work even as customers migrate rules from V1 to V2. We also introduced a `WebhookClient` and a new thread pool which will handle sending emails to customers via HTTP.

## A clean break
You may have noticed that we made a clean break in version 2 from version 1. While you might reason that it's okay for version 2 to share some code with version 1,  we generally avoid doing so. The reason for this is simplicity, and scoping test-ability. We will inevitably be making changes to version 2. When we make these changes the shared code changes might also inadvertently affect version 1. 

The more shared code you have the higher the complexity of your code will be, which in turn requires more [Cognitive_load](https://en.wikipedia.org/wiki/Cognitive_load) to grok the system. In addition, it increases the probability of code changes in V2 inadvertently affect V1. In your mind you only made a change in V2 but in reality the code is shared so you actually made a change in V1 and V2. Because of this your testing strategy must reflect this or you risk making accidental breaking changes to V1 while working on V2.

This is especially useful if we do not plan on adding any new features to V1, as the V1 code base can remain completely untouched as we continue to work and improve V2, further reducing the risk of breaking our customers who still use V1. (and, If we are being realistic; there will ALWAYS be V1 customers. Just because we deprecate a thing, doesn't mean customers will stop using it)

There's also a psychological component where developers generally want to work on the latest and greatest V2, but if they know making changes to V2 is going to be a danger to V1 which in their mind is in the attic gathering cobwebs, they will be less inclined to work on a code base which is intertwined with an older version of the product. Instead, let's aim for simplicity and break the "DRY: once and only once rule" and make a clean break between versions even if that means duplicating some code. 

During the early days of [Mailgun](https://mailgun.com) we had an XML based public API for customers, when we deprecated it, we made a clean break. While the XML code continued to run in production, all new work continued on the JSON based API. After a few years as developers came and went, many all but forgot about the old XML version due to the clean separation of code. Even as code changes happened against the JSON API, we never broke the old XML version. The clean break was so successful that when we eventually retired the XML API years later, many of the new developers who worked on the JSON API for years where shocked that we even had an XML API in production. This is the value of making a clean break. See [The Harmful Obsession With DRY](https://salmonmode.github.io/2020/08/14/the-harmful-obsession-with-dry.html) and [[Clean Code]]

## Premature optimization
Developers as a whole are pretty obsessed with performance and efficiency, (I am among them) and so this clean break design puts many off as it is less efficient than other methods for handling these types of situations. I MUST caution against such thinking. One thing I believe completely is that you must "measure first and then act". 

Looking at the above model, it does appear that the `ForwardEvaluator` might struggle since it must query both v1 and v2 to match a rule. But in practice, and from my experience, such systems work fine until we've actually measured a performance bottle neck. Maintainability and good design are always considered first, only after, when you can measure how well the application is running, should you go back and iterate on performance. So many times, I've imagined that some part of the code will be slow, only to find out later, a completely different part of the code is slower and actually causing a problem. [Always avoid optimizing, before we know that we need too](https://wiki.c2.com/?PrematureOptimization)

> One way to solve rule matching performance issue is by implementing a [Trie](https://en.wikipedia.org/wiki/Trie) structure and storing the rules in a trie and then merging the v1 and v2 trie before evaluation. We can then serialize the trie to a buffer and store it in a cache. We didn't need the Trie for the first year or so, so Premature Optimization saves us unnecessary work early on, and gives us time to refine the product before expensive optimization work is needed.

## Enriching the data
Another important aspect of data moving through the system is the concept of enriching or adding context to the data as it moves through the system. As an illustration, it might be useful to the end user to know which rule matched the forwarded email. We could do this by having the `ForwardEvaluator` attach the rule id to the forward data like so.

```yaml
forward_job:
  email_id: 1234
  to: forwarded@example.com
  from: from@example.com
  context:
    matched_rule_id: 1234
    customer_id: 4566 
```

Now when we pass the `forward_job` to the `SMTPClient` and `WebhookClient` this additional context can be forwarded via email via headers or as apart of the delivered JSON payload. Another typical use is that of authentication. If we can identify the customer via authentication then we can attach that information as context to the data so down stream abstractions and systems can make use of that knowledge without having to go through additional work of figuring out who the customer is.

## Patterns emerge
Hopefully at this point you begin to see a pattern of abstracting inputs and outputs behind well defined abstractions. This results in a modular code base that can adapt as our product grows and expands in scale and complexity. Hints about what modules should be created can always be found by asking "who has ownership of the data", or "who takes ownership after transformation". A transformation doesn't always own the data, but a transformation should typically be it's own abstraction. Following this process does not guarantee you will never have to refactor code, but; by creating the right interfaces, abstractions and data ownership decisions early on we can greatly simplify maintenance of the code and support healthy scaling of the system.

### Getting it wrong
Of course there are often times when the thing you think you are building turns out to be completely different, and you end up throwing a lot of code into the pit of `/dev/null`, while refactoring vast portions of the code base. This happens because we don't always know what we think we know when a project starts out, or assumptions are made that should not have been.  Often, this is because the problem domain is not clear to us, or was not communicated clearly, or requirements have changed. 

This should not deter us from adopting good code design. Far from it! In fact, application of the strategies discussed here can assist during the prototyping and discovery stage of a project. In my experience, I have found that prototyping a public interface without an implementation, is a great way to sus out flaws in our domain knowledge and design. Using the prototype public interface in a different module or part of the system will often lead to a discovery in of our knowledge gap. 

Often times, going through the motion of documenting an interface, writing examples of usage, can be very useful in vetting an interface. This is especially useful when you share the documentation of the interface with those who will consume it. Users of a thing (especially developers) can be very vocal about how you got it all wrong.

I did this when I first started writing a mime parser in golang. I wrote a `example.go` where I took the imaginary mime parsing library and worked through a couple of example exercises of how the library should be used. I then shared the examples with the team and got immediate feed back on what they didn't like, or what the library needed to do, but didn't do. All without writing an single line of actual implementation.

Indeed the first part of any project should be a prototype of the interface, which you then share with everyone who might have an opinion or who might end up using it. Finding a major flaw in the design is often much harder to deal with once the interface is implemented, tests are written, and its ready for PR review.

## Services
Up until now our product has been a monolith, and our parent company wants to make use of our excellent `SmtpServer` and `EmailStore` implementations for other projects. Micro-services, here we come! Let's see how this plays out.

Contrary to the beliefs of enthusiastic developers everywhere, products and teams often find [very](https://www.youtube.com/watch?v=hIFeaeZ9_AI) [little](https://blog.christianposta.com/microservices/istio-as-an-example-of-when-not-to-do-microservices/) [benefit](https://medium.com/@mhetreramesh/when-to-choose-microservices-architecture-over-monolithic-why-794aed04d8db) from implementing micro-service architecture on day one of a product. However, as we’ve demonstrated above, organizing your code and mental model in a micro-service style design provides a great deal of benefit and is a gift that keeps on giving when you decide it’s time to transition to micro-services.

Since our parent company wants to use our SMTP server and other teams need a way to get emails that are received by our SMTP server, let's break those two interfaces out into separate services.

![[Anatomy Of A Product - MicroServices.png]]

As you can see, the `EmailStore` code remains intact and all we do is expose the `EmailStore` interface to the network via `GRPCServer`. Additionally since our interface really hasn't changed clients to the new `EmailStore` micro-service use a similar interface as before, the only difference is the interface is a GRPC client that connects to the remote micro-service.

Now that `EmailStore` is a separate service it might be helpful to review some previous confusion around the concept of data ownership and protection. A service, like the module it wraps, owns the data it stores. As such, it protects it's self from abuse both internally and externally. The mental model does not change from when we transition `EmailStore` as a module to a micro-service. Both implementations should protect the data and it's data store. 

This is why rate limting happens in the `EmailStore` module, and not in the `Receiving Service`.  Since becoming a micro-service It is even more important that we protect the `EmailStore` from accidental abuse as we expose the micro-service to more and more clients on the network.

> [!note]
> Even though rate limiting occurs in the `Storage Service` the `Receiving Service` should relay to the client (if possible depending on the protocol) when the `Storage Service` rate limits requests sent to it. 

### Breaking up the monolith
Now that we have broken out the email store as a separate micro-service, We can also break out the `WebhookClient` and `SmtpClient` into services or even server-less functions which can handle delivery and scale horizontally as demand increases. For our purposes, we will spin them out as services and use Kafka as a replacement for our in-code queues.

![[Anatomy Of A Product - Breaking up the monolith.png]]

Because we organized our project around abstractions, domain driven principles, and ownership, transitioning to micro-service architecture doesn’t require a major refactor of the code. We simply take the existing `WebhookClient` and `SmtpClient` abstractions and place them behind something which consumes work from Kafka.

Even though we did not start this project as a micro-service the DACO mental model mirrors that architecture. In fact I would encourage you to think of abstractions as a collection of micro-service interfaces. Each interface represents what may in the future become a network interface to that micro-service. Services after all, are just an encapsulation of code behind an interface. 

The power in thinking this way is two fold. One, we prepare our code for the micro-service architecture that it may become should our product be successful. Two, we force ourselves to think of data as moving through the system much like data would move through the network.  

Due to the ownership principles applied at the outset we have been able to achieve a high level of quality and scalability with reduced maintenance burden.
### Domain Driven
We've talked a lot about data ownership in this article, but I would like to quickly point out that applying DDD in addition to ownership helps us make good decisions when deciding where to put things in our code base. When defining the boundaries of our micro-services or code modules, we are not partitioning by the number of lines of code, endpoints or methods of our interface, but by the problem domain the modules are solving. 

Each abstraction here has a very specific problem domain. `ForwardEvaluator` decides if an email matches a rule, it’s only concern is to solve this problem in the best possible manner. The same is true of the `SmtpClient` and `WebhookClient`, although you could make the argument that the problem domain they solve is so similar that they could be in the same abstraction. This is a decision you as the code architect have to decide upon, as there are trade offs to both solutions. There is [much written](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjay4HPp4HzAhU_kmoFHfLXAasQFnoECAcQAQ&url=https%3A%2F%2Fwww.amazon.com%2FDomain-Driven-Design-Tackling-Complexity-Software%2Fdp%2F0321125215&usg=AOvVaw3lLATSzmgwNDV7fN_Je7Lg "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjay4HPp4HzAhU_kmoFHfLXAasQFnoECAcQAQ&url=https%3A%2F%2Fwww.amazon.com%2FDomain-Driven-Design-Tackling-Complexity-Software%2Fdp%2F0321125215&usg=AOvVaw3lLATSzmgwNDV7fN_Je7Lg") [on this subject](https://martinfowler.com/bliki/DomainDrivenDesign.html "https://martinfowler.com/bliki/DomainDrivenDesign.html") that can help you make the right decision for your project. See also [[Domain Driven Design]] for a good jumping off point.
## Conclusion
There is a lot to unpack here, and we glossed over a ton of detail to just so we can touch on a several high level topics.

1. Always abstract your input and outputs within the bounds of your problem domain. There is no need to abstract away all interfaces; You wouldn’t abstract the `ForwardEvaluator` interface, but you would abstract any interfaces your problem domain uses to get data in and out. IE: HTTP or GRPC.
2. Our code is a reflection of our problem domain, in the same way our problem domain is a reflection of our code. It’s actually quite helpful to think of the abstractions in your code as micro-services solving a problem domain, they just communicate through method calls instead of network calls.
3. Establishing data ownership early can simplify validation and protection of data and will continue to pay dividends as the system grows.
4.  Design of your abstractions is limited in scope by the problem domain it’s solving. Avoid overloading abstractions even at the expense of perceived performance issues. The product and maintainability always come first, performance can typically be iterated upon later.
5. Learning when and where to use abstractions can help keep the cognitive load low, thus increasing maintainability and scalability. 

We have found that centering the overall system design on a simple mental model using well known design methodologies can greatly improve the success of our projects and help us reduce both technical and architectural debt. Using this model of thinking has allowed us to grow and scale systems in a clean and maintainable way. It is my sincere hope that this can be shared and will assist you in your products as well.
