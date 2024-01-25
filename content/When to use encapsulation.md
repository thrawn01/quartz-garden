---
tags:
  - programming
  - design
date: 2024-01-12
---

Encapsulation is one of those concepts that is a pillar of OOP design, and is a VERY useful tool when used in the correct context.

### When to avoid
Avoid using encapsulation when interacting with other systems, objects or structs. For instance, saving a thing to a database or a file. This is NOT encapsulation, as the instantiated thing DOES NOT OWN THE FILE FORMAT OR THE DATABASE SCHEMA.

```go
// Bad
thing := Newthing()
thing.Save(fd)
thing.Save(db)
```

Instead, we pass off the encapsulated thing to a system which knows how to extract the information it needs to serialize the data into the format and system it's destined for.

```go
// Good
thing := Newthing()

json.Marshal(thing)
gob.Marshal(thing)
db.SaveThing(thing)
```

Yes, I'm explicitly saying that the [ActiveRecord](https://en.wikipedia.org/wiki/Active_record_patternhttps://en.wikipedia.org/wiki/Active_record_pattern) pattern is a BAD pattern and should be avoided. (unless you write Django, or Ruby On Rails, then I'm sorry to be you)


### When to use
When the data you are providing access to is highly complex and needs a in code representation that the coder should interact with which lowers the [Cognitive Load](https://en.wikipedia.org/wiki/Cognitive_load)for the coder.

For instance, I wrote a MIME parser for parsing emails which presented it's self as an encapsulated struct in golang.

```go
root, err := mime.Decode(context.Background(), strings.NewReader(rawContent))  
if err != nil {  
    panic(err)  
}  
  
h := root.Headers()  
  
v, err := h.Get("X-Originating-Ip")  
if err != nil {  
    panic(err)  
}  
fmt.Printf("Originating IP: '%s'\n", v)

for it := root.Traverse(); it.Next(); {  
    part := it.Part()  
  
    // Get the content type  
    mt := part.GetMediaType(header.ContentType)  
    if mt == nil {  
       continue  
    }  
  
    if !part.HasBody() {  
       continue  
    }  
  
    switch mt.SubType() {  
    case "plain":  
       bodies.TextBody = append(bodies.TextBody, part.GetBody(true))  
    case "html":  
       if part.HasBody() {  
          bodies.HtmlBody = append(bodies.HtmlBody, part.GetBody(true))  
       }  
    }  
  
    if part.GetAttachment() != nil {  
       bodies.Attachments = append(bodies.Attachments, part)  
    }  
}
```

This worked well, because the MIME file format WAS the thing that I needed to encapsulate. It was the complexity which I needed to hide behind an abstraction.