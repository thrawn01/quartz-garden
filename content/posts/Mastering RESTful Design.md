---
date: 2022-12-10
tags:
  - programming
  - design
  - http
  - rpc
---
> Mastering RESTful Design: A Decade of Lessons Learned and Best Practices

When designing a RESTful API, it is helpful to be aware of some common pitfalls that may seem harmless at first but can lead to issues for infrastructure, maintenance or future expandability of the API product years down the road. In this article, I recount some poor design decisions we made at [mailgun.com](https://mailgun.com) over the years and provide recommendations on how to avoid or adapt as these problems arise.

Our folly, is your reward.... now on with the show.

## Controlling URL Complexity
Developers should keep in mind that the URL path is the primary way systems route requests and determine access controls for many public and private API’s. The more complex the path, the more complex the routing rules must be for the API gateway or service mesh systems that route requests to your endpoint. Additionally the more complex the route, the greater possibility your route will collide with a another route in ways that you may never had anticipated. (We discuss this in depth later). In addition, there maybe several proxy, middleware and security interceptors (in app and on the network) which enforce controls on a specific paths which may struggle to match or accidentally match routes that it should not or not match routes it should, thus generating an un-intended security incident which might be detrimental to your paycheck.

Reducing URL complexity not only makes your API easier to understand for users, it has real world implication for infrastructure, security, and governance. Let's discuss some do's and don'ts as we strive to control URL path complexity.
### Avoid user provided data in the path
The primary reason to avoid user provided data in a path is because not all URL parsers and routers are created equal. Indeed the RFC spec leaves some room for interpretation when encoding/decoding the URL. For instance, we have experienced issues with the `/v2/domains/{domain}/tags/{tag}` endpoint, where a user would add a tag called `#trending` such that the URL becomes `/v2/domains/example.com/tags/#trending` which is completely valid, as `#` in the URL spec is considered a page anchor, but really isn't what we wanted. Even if you force the `#` to be URL encoded many parsers including python flask apps will URL decode the path BEFORE applying routing. Thus the tag `#trending` is parsed as a URL Anchor instead being considered part of the URL path and will not be matched by the python router to the proper handler.

This sounds like might be just a corner case for python routers, but this sort of encoding and decoding during routing happens quite a bit in even small infrastructure environments. Consider a UI stack that consists of a JavaScript front-end, with a python proxy which routes requests to back-ends written in Golang. Not including any reverse proxies or route based service meshes, that is 3 languages all with their own RFC interpretation of URL encoders and decoders and routing rules and handlers. Additionally, If you are a service provider like mailgun.com you will likely have third party companies that write applications and UI stacks that access your API’s. The more complex your routes, the more likely their developers will also run into similar problems, which generates mountains of unwanted support requests. (Ask me how I know)

Lets consider a few solutions to this problem, and talk about the trade offs and benefits.

### Making user data URL safe
In an attempt to keep user provided data from interfering with URL routing for the above `/v2/domains/{domain}/tags/{tag}` endpoint; Lets say we normalize all user `tags` to remove anything that might interfere with URL parsing or routing. This means we need to remove or normalize at a minimum the following characters `&/*?#` , this list doesn’t include all the Unicode variants of `&/*?#` of which there are many. Now lets say we replace all instances of these characters with `_` in order to make the tag URL parsing safe. Now the `GET` becomes `/v2/domains/example.com/tags/_trending`. This normalized version has very little chance of confusing a parser. However, consider the user adds the tag `2020/02/01` which would normalize to `2020_02_01`, now consider the user decides to create a tag called `2020_02_01`. Now we have 2 tags which from the users perspective are different ( `2020/02/01` vs`2020_02_01` ) but from our systems perspective these tags are identical. From experience this has caused a great deal of user confusion and frustration. Another way of handling this, is to make all these characters invalid, and reject any tags created with these characters. However detecting all the unicode variants can be difficult, and our refusal to create tags that contain this list of characters would appear arbitrary and confusing to our users who are not familiar with the URL routing problem.

### Use unique ids in the URL path
All of the aforementioned problems with routing and normalizing user data can be fixed by simply using a unique id (UID) in the URL. Consider fetching the `#trending` tag with `/v2/domains/example.com/tags/3f5sdf6g`. This call is definitely URL parser safe, however it requires the user to have previous knowledge of the UID `3f5sdf6g`. In order for the user to discover the UID the user can either store the UID on tag creation, or retrieve the UID from some other API you provide before making a call to `/v2/domains/example.com/tags/3f5sdf6g`

Let's explore what this other API could look like, and assume the user has no prior knowledge of the UID and wants to retrieve the tag from our system. We can provide the user with a few options, all of which have implications for future growth.

Lets first consider the naive solution. Give the user a way to iterate through all tags via `/v2/domains/example.com/tags`. We can provide some additional parameters like `page` to allow the user to page through many thousands of tags to find the one they want. This is very inefficient and time consuming both for us as a service provider and the user as we waste network bandwidth sending page after page over the network.

The logical next step is to provide some sort of search or find functionality. Lets do that by creating a simple search query parameter. `/v2/domains/example.com/tags?find=#trending` this is kind of nice as we could also allow the user to preform wild card searches like `#*` or `#trend*` to find all tags that start with `#` or `#trend`. However, this single API choice (providing search capability) has implications for the complexity and scalability of our API. How so?

First, this API call now requires our back-end to support searching and indexing of data. We have now excluded; or at least made more complex, the use of possible noSQL data stores (like Cassandra) that have the potential for higher scaling capabilities than traditional Relational SQL or Document databases. By our API design, we have artificially placed restrictions on how we scale the service into the future.

Second, We artificially have placed an additional burden on the network as we now require users to make two HTTP calls to retrieve all data about a tag. One to find the tag’s UID, the other to fetch the tag data. This effectively doubles the amount of traffic our API must field to preform simple operations. We could of course avoid the second call by returning all the tag data via the search API call. But now that we have given our users this powerful (and computationally expensive) search API. We must hope users don’t abuse it by continuously making in-efficient wild card searches just to get a single tag. (yes, they will do this)

You might think `“wait, indexes aren’t computationally expensive?? wut is he talking about?”.` Imagine for a second a database with not hundreds or thousands of tags, but billions and billions. Now imagine updating and querying that index. Your product might not have to deal with sort of scale, but it's the scale we deal with every day at [mailgun.com](https://mailgun.com). This is the sort of things that API designers might not worry about when scale is small, but will have implications as scale continues to grow.

### UID or Not to UID
As we have seen, normalizing or using UID’s are both valid solutions to the URL path parsing problem, they both have downsides which must be considered. If your API already requires search capabilities then using UID’s is a perfectly valid solution. Internally we have had many API’s that strictly use UID in the path. UID’s like customer id or user id are resource identifiers known by many clients and services which can be shared across service boundaries. There is no right or wrong answer here, you as the developer must understand who your users are and make judgment calls on how your API will be used and grow over time. However, making the right decision early can have a huge impact on the success of your API now and in the future.

### KISS - Keep It Simple Stupid
The simplest and most scalable solution to the tag API problem is to create a call like so `/v2/domains/example.com/tags?tag=#trending`. The URL path is simple to parse and route, the use of query parameters means that we escape special characters in a predictable and cross compatible manner, query parameters also support unicode so that’s not a problem either. The simple key / value design of the API means that we have options on how we stored the data. We can store key values efficiently in any datastore, including NoSQL, document and relational databases.

But wait a second, doesn’t your tag example included a user provided value? Isn’t the domain name `example.com` in `/v2/domains/example.com/tag` a user provided value? Yes, it is, and as with most things in life, there are exceptions where it makes sense, and I left the `example.com` in the URL to illustrate this point. Domain names are an exception in that DNS domain name rules don’t allow unicode or special symbols in a domain name, so they are generally safe for use in URL paths. (See [punycode](https://en.wikipedia.org/wiki/Punycode "https://en.wikipedia.org/wiki/Punycode") for unicode domain names). However the inclusion of the domain name in the URL path is not without future risk, the DNS restrictions on special characters could change in the future and cause problems for our API sometime in the future. For now, we consider this risk minimal and have found that scoping many of our API calls at Mailgun by domain to be user friendly and simple.

## Organizational challenges of a Restful API
Okay, lets say we make an endpoint to manage a list of email contacts for a domain. Following the restful pattern a domain is under an account so we make the following endpoint.

`/v1/accounts/{id}/domains/{domain}/contacts`

We test and deploy to production, users are happy, we have a beer and smoke some brisket to celebrate. (I live in Texas, it's a thing)

A few months go by and now users are telling us they want the ability to create and use email contact lists across any domain under their account. No problem! lets create

`/v1/accounts/{id}/contacts`

But there is a problem, the accounts API already has an endpoint called.

`/v1/accounts/{id}/contacts`

The accounts endpoint manages a list of contacts that own the account like `admin@example.com`, or `accountowner@example.com`. This endpoint makes perfect sense from the "accounts" perspective, but not from the account wide “email contacts” perspective. Indeed, depending on who is looking at these endpoints one might be confused by the other.

So where do we put the account level email contacts? We have a few options, all with trade offs.

**Option 1**, Create a the following endpoints
* `/v1/contacts/domains/{domain}` 
* `/v1/contacts/accounts/{id}` 

Then deprecate `/v1/accounts/{id}/domains/{domain}/contacts`. But now we've lost our nice intuitive hierarchical structure that made rest so appealing. Honestly this is a perfectly valid answer to this problem. (See the **Flat Organizational structures** subheading) That is, until we create a new API for organizing contact lenses. “You heard it here first, Contact Lenses as a service" (Trade mark pending, DW 2022)

**Option 2**, Create an endpoint called `/v1/accounts/{id}/emailContacts`. Again, we lose our intuitive restful structure, because this new endpoint is inconsistent with `/v1/accounts/{id}/domains/{domain}/contacts`

**Option 3**, Bump the entire API version to `/v2` and reorganize/rename all our paths to make sense.
* `/v2/accounts/{id}/domains/{domain}/emailList`  
* `/v2/accounts/{id}/emailList`
* `/v2/accounts/{id}/contacts` 

If we are going for consistency and intuitive design, it seems reasonable that this is the best answer. However, in doing this we must keep a few things in mind.

### Versioning
Even if you deprecate the older `/v1` endpoints, users will continue to use them. We have a saying at Mailgun, “Once you release it, it lives forever”. The major reason for this isn’t technical, but financial. Many of the companies that integrate with our API use third-party contractors to preform one time integrations. If you force them through the pain of an API deprecation, that usually means more third-party contractor work. While they are spending time and money to re-write an integration with your API, they may think twice about continuing with you as a service provider. Forcing a deprecation always gives users the opportunity to consider your competitors, or in the case of internal API’s, wasting the time of your fellow developers.

### Versioning adds complexity
Managing multiple versions in source code can be tricky and error prone. Adding new functionality or fixing bugs in one version could break old versions, this means you will need to update tests for both new and old versions forever. This can add significant technical debt, increasing development time and will make babies all over the world cry tears of sadness. 

##### How many versions until the complexity cost is to high?
The question is not **IF** you will have to introduce yet another version, but **WHEN**. So, how many versions of a thing until the cost of maintaining multiple versions with possibly overlapping functionality becomes too much?

This cannot be over stated enough, one of the ways we at Mailgun have historically created a great API culture, is to keep complexity and technical debt of our systems low by avoiding new versions of things at all cost. Yes, all costs! The alternative is to have the chaos of constantly changing and managing versions of things, and as that chaos grows, our engineering organization will be forced to reach for the same tools that all enterprise software development houses use to tame their service contract beasts, and the wild developers who constantly change them, the dreaded solutions architect and API governance board!  (Me no likey)

Remaining diligent, deliberate and non cavalier about adding new API's both internally and publicly can go a long way to controlling API explosion, and as a result, we can build a decentralized culture of API governance. We recommend every team which desires to add a new API to first design, document and share the API with every possible person who may have an opinion about the API before you implement it. So... If you want to design a new API and haven't talked to at least 3 other people including your senile grandma, then you really shouldn't implement the API.

> Something to keep in mind: The `/v2` green field looks nice, until you realize there is a septic tank just under the surface that needs maintenance.

See [[Forwarding Product V2]] for a deeper discussion on how to handle multiple versions if you are interested.

## The Restful Hierarchy Problem
Next, we talk about the hierarchy problem, but, this post has already gone much longer than I originally imagined, so I'm breaking it up into separate posts. You can find the next post here [[The Restful Hierarchy Problem]]