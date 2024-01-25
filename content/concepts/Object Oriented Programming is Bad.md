---
tags:
  - programming
  - design
  - thoughts
date: 2024-01-12
---
This is an un organized collection of thoughts and links on why we as an industry are moving on from OOP.
### The Rage
* Object Oriented design is the roman numerals of computing. – Rob Pike
* The phrase Object Oriented means a lot of things. Half are obvious, and the other half are mistakes. – Paul Graham
* Object-oriented programming is an exceptionally bad idea which could only have originated in California. – Edsger Dijkstra
* I used to be enamored of object-oriented programming. I’m now finding myself leaning toward believing that it is a plot designed to destroy joy. – Eric Allman
### The Good Parts 
As a primer for those coming from an OOP background let us consider the pillars of OOP which are encapsulation, abstraction, inheritance, polymorphism. Of these both encapsulation and abstraction have proved to be the most powerful and ubiquitous amongst all the generic languages, and as such they continue to be a pillar of interface-based programming. Inheritance and polymorphism however have introduced many more problems than they solve of which this has been well documented.
### Modern Languages without OOP
* Golang
* Rust
### Tight Coupling
OOP introduced the concept of tight coupling of methods with data as properties of an object. And while it may occasionally be useful to tightly couple data and methods I would generally consider this to be an anti-pattern when considering the system as a whole. While this doesn't have to be, I see so many developers doing this, as they see no other way to doing this in OOP. (Which is BAD)

### Hierarchy
OOP drives you toward Hierarchy, which then makes change hard, as you made assumptions about the current way the system works and thus it's hierarchy. The same is true for [[REST]]. 

## Avoid thinking in OOP
Traditionally, as programmers, we are taught Object-Oriented Programming (OOP), and so a great many programmers' mental models follow an OOP style of object hierarchies and interactions. However, the OOP model is not practical at the systems architecture level. For how would one deliver an instantiated instance of class `User` over the network to the authentication server? You must instead, instantiate, serialize, transfer the data then un-serialize and reinstantiate. While this isn't a problem for a monolith, many systems will eventually need to grow beyond the monolith in a service based or distributed system. If you write your code in an OOP model, making this transition if much more difficult to achieve. See [[Anatomy Of A Product]]

In OOP we encapsulate data in an object, then ask that object to perform actions upon the data, for instance, you might create a `User` object with a name and age, then ask the `User` object to `save()` itself, in this way you can think of the data as almost self-aware such that we say “the data knows how to save itself to the database”. Instead, you should think of data as a simple struct or stream which moves through the program like parts on a conveyor belt. See [[When to use encapsulation]]

Thinking of data moving through a program is in fact, the natural order of how programs and operating systems operate. Every meaningful program that has ever been written takes some sort of input and produces some sort of output. Anyone who has done a tour as sysadmin knows how to construct a bash one liner that pipes output from one process into the input of another. In fact, a major reason why we have operating systems is to facilitate this type of input and output between processes. Desktop GUI, TCP/IP, UDP, Standard IN, Standard OUT, Keyboards, Mice, it’s all just I/O provided by the OS to facilitate the processing of data. 

### Game Engines and OOP
Watch this presentation about using Rust for building a game engine, which they first attempted to build in C++ using OOP.

![RustConf 2018 - Closing Keynote by Catherine West](https://youtu.be/P9u8x13W7UE?si=xRCq7Lu7VEkvopfm)

Yes, I'm well aware that [GoDot](https://godotengine.org/) is an Object based game engine. They get around the hierarchy issue by implementing an event or notification system which objects can subscribe too regardless of where in the hierarchy the object exists. (A good thing).

Most game engines understand there are more down sides to OOP than good, so they are based on [Entity Component Systems](https://en.wikipedia.org/wiki/Entity_component_system)instead of OOP. In fact, even though GoDot claims to be a Object based game engine, it shares a lot of concepts with Entity Component systems.
### See Also
* [OOP considered harmful - Iurii Krasnoshchok](https://medium.com/@aka.rider/oop-considered-harmful-68e2aa136ff9)
* [OOP, The Trillion Dollar Disaster - Ilya Suzdalnitskiy](https://betterprogramming.pub/object-oriented-programming-the-trillion-dollar-disaster-92a4b666c7c7)

As [many](https://suzdalnitski.medium.com/oop-will-make-you-suffer-846d072b4dce "https://suzdalnitski.medium.com/oop-will-make-you-suffer-846d072b4dce") [have mentioned](https://betterprogramming.pub/object-oriented-programming-the-trillion-dollar-disaster-92a4b666c7c7 "https://betterprogramming.pub/object-oriented-programming-the-trillion-dollar-disaster-92a4b666c7c7") [before](https://www.leaseweb.com/labs/2015/08/object-oriented-programming-is-exceptionally-bad/ "https://www.leaseweb.com/labs/2015/08/object-oriented-programming-is-exceptionally-bad/") we have found that the OOP model is less than desirable when designing large scalable systems. Instead, by using the Domain driven, Abstraction, Interface and Ownership we build scalable, low cognitive overhead, maintainable code. 