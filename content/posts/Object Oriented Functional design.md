---
tags:
  - programming
  - thoughts
date: 2009-08-18T00:00:00Z
---
While on an interview and talking with a co-worker I had to explain my
position on object oriented design. I feel a short blog post is in
order.

Objects encapsulate state, like a User class might encapsulate the user
name and password of a user. Processes act upon that state, processes
shouldn't create more state, but only manage the state that is required of the
program. Processes can be expressed best in a functional programming style,
however state can not. State can be managed best by encapsulation into
objects, Processes do not benefit from encapsulation. Think of functions as
Processes, they usually act upon data with an input and output that needs to
be stored somewhere as state, think of objects as the storage of that
state. Once we clearly define these relationships, its easy to see a utopia of
the 2 concepts is a mix of Object encapsulation for data and state, and
functional programming style for the methods that act upon the objects.

There are many contenders, but I'm not quite sure any of the languages today
offer this perfect mix of objects and functional mix. In absence of this
perfect mix, my goal as a software engineer is to write software in a
functional way while at the same time reducing state within the methods and
ensuring my methods act only upon the state that is within the object its
attached to. Once you start using methods from one object to act upon the state
of another object, you might as well not have object encapsulation at all and
place the state into global space, as the  entire reason you created the
objects was to manage the state by using only the methods attached to that
object.

This leads to a startling conclusion some might find controversial, Getters and
Setters are evil, If you ever think you just cant live without a getter or
setter, you may need to rethink your design.
