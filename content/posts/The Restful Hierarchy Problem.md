---
date: 2022-12-11
tags:
  - programming
  - design
  - http
  - rpc
---

> [!note]
> This is a continuation of a previous post entitled [[Mastering RESTful Design]] I recommend reading that first for some context.

A major selling point of Restful API’s is also it’s biggest pain point. Restful interfaces imply a hierarchical order. Take for instance the Contacts API example from above, viewed as a hierarchy.

```
- Accounts
  - Billing
  - Contacts
  - Tickets
  - Domains
    - Contacts
    - Emails
      - Events
      - Resend
      - Stats
```

While this hierarchy makes sense today, as we saw previously, it might not make sense in the future. As we add/change new products or acquire new companies with new products this hierarchy will change.

This isn’t a problem with REST, but a problem with hierarchical systems. As any organization continues to grow and add new items to the hierarchy, there will come a time when we have to re-organize the hierarchy in order for it to make sense. This is why organizations, (especially large corporations) go through management reorganizations once ever quarter or so. They are reorganizing their hierarchy in order for it to make sense and align with their goals.

In our industry we call developers “engineers” as if we are designing a skyscraper, bridge or something. I think we are more like Gardner's. We plant, establish a root system, then guide the branches and leaves as the system continues to grow and gain complexity. No structural engineer ever starts to build a 100 floor skyscraper, then half way through the project refactors the 10th floor into a Ferris wheel because the customer is a romantic.

But we as developers have to make these Ferris wheels happen all the time. We work in an industry that is constantly changing, as such our systems constantly change with it. We have to live in the reality of this organic growth, As such, we should be cautious when using and organizing our systems in a hierarchical manner. One way to avoid the hierarchy is to not do it in the first place.
### Flat organizational structures
We’ve seen the possible pitfalls of a hierarchy, one way of combating it is by avoiding deeply nested hierarchies. Consider **Option 1** from the contact list problem.

* `/v1/contacts/domains/{domain}`
*  `/v1/contacts/accounts/{id}`

Here we have a thing that _could_ be deeply nested under both `accounts` and `domains`. Instead we flatten the hierarchy and organize by the subject (thingie?) or problem domain we are acting upon. You could also think about this as organization around a product or service as it’s unlikely that everything under the account hierarchy will be handled by the `account` product. It seems reasonable to conclude that there is also a `contacts` product that handles the `/v1/contacts/*` endpoint, but I digress.... 

Lets go deeper, lets assume within the `contacts` service we have the concept of multiple lists of contacts. That relationship looks like this.

```
- Contacts 
  - Contact Lists (One to Many)
    - Contact Members (Many to One)
```

In this way, the user could have many contact lists, each with different contact members.

```
- Contact-List-1
   - customer1@aol.com
   - customer2@morty.com
- Contact-List-2
   - customer42@dontpanic.com
   - customerNeo@matrix.com
```

Let's assume we made the same mistake as in the hierarchy example above and assumed contact lists could only be attached to a customer domain in our initial version. So our API might naively be.

* `/v1/contacts/{domain}` - Manage contact lists for a domain
* `/v1/contacts/{domain}/{list-id}/{member-id}` - Manage members in a contact list 

As you might guess, this API has a few problems.

First, we have several path arguments directly after each other `/{domain}/{list-id}/{member-id}`, and while this isn’t the end of the world it does make for a much more interesting route for our systems to match. Of more interest to us is how the API route is perceived by the user, or more accurately how the user isn’t given a clue about what goes in the `{domain}` , `{list-id}` or `{member-id}` path arguments of the URL.

Making calls to `/v1/contacts/example.com/3f5sdf6g/62sgsd435` can be pretty confusing to both the user and the implementer. By adding a qualifier to path arguments we add a bit more length, but gain a lot more clarity.

* `/v1/contacts/domains/{domain}/lists/{id}/members/{id}`

Now that we’ve added a qualifier to the URL, in 3 months when users ask for account level contact lists, this is a simple addition of

* `/v1/contacts/accounts/{id}/lists/{id}/members/{id}` 

In addition, this design also gives us freedom to add future subjects and methods under the `/lists` object while avoiding conflicts with other paths. For instance, as a convenience to our customers (or the UI) we might want to add the ability to remove old lists created before a certain date.

* `/v1/contacts/domains/{domain}/lists/remove?before=2019-01-01`

Keep in mind we future proof theses paths only if we are using UID’s in our path arguments and not allowing user provided data into the path. Imagine we didn’t use `ids` for the list, and a customer has a list called `remove` and we added our new clean up function also called `remove`. We just made it impossible for our customer to access the `/v1/contacts/domains/{domain}/lists/remove` contact list. 

So..... what if we don’t want to use UID’s; instead we want user provided keys! Also, we are just sick of all these authoritarian hierarchies! What is an API designer to do?

## RPC
So, I hear you need a rest from REST (Trade mark pending, DW 2022). Welcome to the dark side my friend, enter the world of RPC.

In keeping with our contact list example, lets see what an Email Contacts RPC like API might look like.
* `/v1/contacts/lists` - Manage contact lists 
* `/v1/contacts/members` - Manage contact list members

Here we have dropped the path arguments, in favor of a method like call. Each argument that would have normally been provided in the path is now passed as a either a query parameter or as a multipart form parameter.

Lets first consider that we have removed the `/domains` and `/accounts` hierarchies. How do we get lists by domain? We might do this by providing a `domains` query parameter, as such the call would be
* `/v1/contacts/lists?domain=example.com&name=contact-list-1`

In this manner we are not restricted to the use of UID’s, in fact for this case the use of an UID would be counter productive as the `contact-list-1` can act as a unique identifier provided by the user. You could also simplify the URL path further by avoiding query parameters and POSTing the method arguments as JSON in the body of the request.

So, what about our 3 month’s down the road scenario, and users ask for account level contact lists? With RPC this is even simpler, we could just add an `account_id` parameter.
* `/v1/contacts/lists?account_id=f23b08s8a&name=contact-list-1` 

Now we have a single endpoint that allows multiple query options to refine a list of domain or account level contact lists.

### The POST office just called
Wait a minute.... If we are not doing REST.... is there a need for all those HTTP verbs we love so much in REST like GET, POST, PUT, DELETE and the much forgotten PATCH. Many of the commercially available public API’s that use RPC like methods avoid using verbs to avoid confusion. The only thing that changes is the URL path (which is simply name of the method) and the content of your POST, which is usually in JSON format. (You could use protobuf or some other serialization by adding an `Accept: application/protobuf` header.)

For an explanation as to why we might not want to use HTTP verbs in RPC, let's consider the following CRUD Operations.
* `GET /v1/contacts/lists` - List contacts 
* `GET /v1/contacts/lists?name={name}` - Get a contact list 
* `DELETE /v1/contacts/lists?name={name}` - Delete a contact list
* `POST /v1/contacts/lists?name={name}` - Create a new contact list
* `POST|PUT /v1/contacts/lists/remove` - Remove all lists before a certain date  

Most of the calls make sense until we consider that the contact `list` and `get` methods could be confusing to users. The only difference between the two are the inclusion of the `name` parameter. If your `list` and `get` methods return the same level of detail for each call, this might make sense, but if your `list` only returns a subset of fields, then a separate `get` which returns all details of an object might be needed.

To make this more consistent you might suffix all your calls with method names.
* `/v1/contacts/lists/list` - List contacts   
* `/v1/contacts/lists/get` - Get a contact list
* `/v1/contacts/lists/delete` - Delete a contact list
* `/v1/contacts/lists/create` - Create a new contact list
* `/v1/contacts/lists/remove` - Remove all lists before a certain date

In this scenario the inclusion of the HTTP verbs are a duplication and not necessary. Additionally we are free to add methods and objects in ways that operationally make sense regardless of hierarchy. Even though members have a many to one relationship with lists, that hierarchical relationship doesn’t need to be exposed in the URL, since our API doesn’t reflect the model, but the method calls that operate on that model. Consider what managing the members of the list might look like.
-   `/v1/contacts/members/list` - List members in a contact list
-   `/v1/contacts/members/validate` - Validate all the members in a contact list
-   `/v1/contacts/members/prune` - Prune all members that fail the validation check

You can also forgo the `/` separator if you prefer a more `subject.action` style. Doing this would give a strong indicator to your users that this is not a restful interface, but an RPC like interface, and indicates to the user that these are actions operating on an subject or collection.

-   `/v1/contacts/members.list`
-   `/v1/contacts/members.validate`

This is how many of the [slack API calls](https://api.slack.com/methods/chat.postMessage "https://api.slack.com/methods/chat.postMessage") are designed.

### REST is slower than RPC
I can't over state this enough, POST based RPC style API's will always out perform RESTful API's for the simple fact that a RESTful API requires a router to parse and match complex routes. This is why high performing HTTP routers are so hotly debated and loved / hated by developers. 

It doesn't matter what language you use, making 10,000 HTTP calls to the endpoint `/v1/contacts/members.list` will always out perform the same parsing, capture and translation of a similar endpoint in REST `/v1/contacts/accounts/{id}/lists/{id}/members/{id}`. The act of parsing and capturing will always be slower than a simple string compare. This fact, combined with the use of protobuf as it's serialization format is the No1 contributor to GRPC's performance improvements over REST

### GPRC or not to GRPC
I was planning on writing a little section here about the merits of GRPC, but I'm sure you can find X number of articles on the internet for that sort of thing. Then I decided to write a brief overview of why GRPC is falling out of favor at Mailgun in recent years and then talk little about something I came up with while on a drunken rampage one night. But my brain doesn't understand the words `little` and `brief`, so I decided to write a completely different post about that. If I've peaked your interest, I'll eventually link that article here.

## Conclusion
I hope this article helps you on your REST journey, and hopefully there are some mistakes we made which you won't have to make.