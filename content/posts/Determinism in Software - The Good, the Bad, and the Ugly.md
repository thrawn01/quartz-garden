---
date: 2025-05-27
tags:
  - golang
  - programming
  - testing
---
If you’ve ever debugged a flaky test or tried to reproduce a bug that only happens “sometimes,” you know the pain of non-determinism. But what exactly is determinism in software, and why is there such interest in Deterministic Simulation Testing? (DST)

> If you've ever checked the time in an `if` statement, your program just became non-deterministic. — Will Wilson
### Why Determinism Matters
In critical systems - think automotive ECUs, aerospace flight controls, or medical devices - determinism isn’t just nice to have. These systems rely on Real-Time Operating Systems (RTOS) to guarantee that tasks are scheduled and executed in a predictable way. If a safety-critical task in a car runs late (or early), you could find yourself on the side of the road, or worse.

As vehicles become rolling computers, the push for deterministic software architectures is only getting stronger. Modern systems are being designed to ensure that software behaves identically, whether it’s running in the cloud or on the road.

In more mundane software, functions and methods need to behave deterministically, producing the same output for the same input every time, regardless of when or where they are executed. When software is deterministic, tests pass consistently, and the behavior of the application is well understood and predictable. Controlling determinism of code abstractions under test enables a developer to trust that the failure is due to a real code or logic change, not because of hidden randomness or environmental differences.

Without determinism, testing becomes a guessing game. Flaky or non-deterministic tests can pass or fail seemingly at random, eroding developer confidence and making debugging a nightmare.
### Determinism In Games
Game developers have been capitalizing on determinism for decades. Players expect their titles to run flawlessly, delivering the exact same gameplay experience every single time, whether they're playing today, next month, or even decades later. A single crash or significant bug -- even if it happens just once a month -- can seriously damage a game's reputation.

Imagine a major AAA game crashing on launch day. Players would be in an uproar, and the game would be labeled as "garbage" or "unplayable." Yet, in the world of enterprise and SaaS products, services with a crash rate of one or two per month are often considered "acceptable" provided they remain within the established error budget.

In part, games achieve high reliability by implementing deterministic game loops. The game loop uses fixed time steps to ensure that physics, AI, and gameplay logic behave predictably and consistently. Because of the deterministic nature of these core game loops, events and entities are updated and displayed in a highly consistent manner. This determinism enables developers to replay, reproduce, and track down bugs, setting a high bar for reliability.

If you've ever watched the opening screen for Super Mario Bros. 3, where the game replays a recorded sequence of inputs for Mario, frame by frame, resulting in an exact, repeatable demonstration every time, you've seen game loop determinism in action.

![[SuperMario3Intro.png]]
  
### Reliability Through Determinism: TigerBeetle and Friends
[TigerBeetle](https://tigerbeetle.com/) is a young project, but already making waves due to it's reliability. How? Because its core is deterministic, allowing its creators to simulate decades -- or even thousands of years -- of usage in a matter of hours. [This builds confidence that the system will scale and recover reliably](https://docs.tigerbeetle.com/concepts/safety/), no matter what gets thrown at it. Determinism, combined with simulated testing, lets TigerBeetle earn a reputation for reliability that would normally take years to establish.

[FoundationDB is another standout example of determinism in action.](https://pierrez.github.io/fdb-book/meet_fdb/correctess.html)  The team behind FoundationDB invested years into building a deterministic simulation framework, driven by their custom Flow programming language, which enabled them to simulate an entire cluster's behavior within a single-threaded process. 

This allowed FoundationDB to run exhaustive, repeatable simulations of network partitions, machine failures, disk faults, and other real-world scenarios—often at a 10-to-1 ratio of simulated to real time—enabling them to discover and fix bugs long before the software ever touched production hardware

During development, FoundationDB's in simulation runs accumulated the equivalent of a [trillion CPU-hours of simulated stress testing over the years.](https://apple.github.io/foundationdb/testing.html) This relentless focus on deterministic simulation not only led to a remarkably robust and reliable distributed database, but also played a key role in its acquisition by Apple, who now relies on FoundationDB as a core part of its cloud infrastructure
### The case against Determinism
But determinism isn’t always a win. Sometimes, it can open the door to exploits. Take the Super Mario example from earlier. Because of Super Mario's deterministic nature, speed runners and hackers can manipulate the game state with precise inputs delivered via the controller, triggering bugs that let them rewrite memory and even the game’s own code. The same predictability that makes a system reliable, can also make it exploitable

> See https://youtu.be/hB6eY73sLV0?si=_9Wh0w_yhEfB4Gm2&t=102 for a demonstration the Super Mario exploit. (Starts at 1:42)

This isn’t just a retro gaming curiosity. [CVE-2021-20226](https://nvd.nist.gov/vuln/detail/CVE-2021-20226) let attackers exploit deterministic behavior in the `io_uring` subsystem to escalate privileges. They did this by sending crafted `io_uring` requests to bypass refcount checks. In essence, crafting a set of inputs to exploit the consistent broken behavior. Predictability can be a liability when attackers know exactly how the system will respond to crafted inputs.

To be clear, I am not suggesting that software designed to be strictly deterministic and simulatable is inherently insecure. I merely mean that determinism is not a panacea—it does not  guarantee high-quality software. Whether a system is deterministic or not, we must always consider security of the system, and how the system might be abused. Merely being deterministic does not mean that we have simulated all possible bugs or that the system is immune to exploitation.

**Golang: Embracing Non-Determinism (On Purpose)**
Case in point, the Go team made a conscious decision to avoid determinism in certain areas. For example, Go’s `select` statement chooses randomly among ready channels, rather than always picking the first. Why? To avoid starvation and reduce the risk of timing-based exploits. If channel selection were deterministic, attackers could predict system behavior, and developers might accidentally introduce subtle bugs.

If Go's `select` statement were made deterministic—always choosing the first channel in source order that’s ready to communicate—it could lead to starvation. For example, if `requestChan` is always ready with data, the `select` would repeatedly read from it, causing the `shutdownChan`'s code block to never execute. By instead selecting channels uniformly at random, Go ensures that every ready channel eventually gets processed. This design prevents starvation without requiring complex algorithms to manage channel priority.

```go
select {
case req := <-requestChan:
    handleRequest(req)
case <-shutdownChan:
    gracefulExit()
}
```

Go also deliberately shuffles map iteration order. This prevents developers from relying on unstable iteration sequences and helps mitigate hash-collision DoS attacks. Even Go’s runtime uses techniques like address space layout randomization (ASLR) to make memory corruption exploits harder.
### Challenges of Building a deterministic system
Achieving true determinism is a massive challenge and remains an [active area of research.](https://dedis.cs.yale.edu/2010/det/) Most programming languages and system libraries are designed for performance and flexibility, not for reproducibility or total control over non-deterministic sources like time, random numbers, or thread scheduling As a result, even reaching partial determinism often demands extensive time and effort.

Moreover, deterministic systems are only as robust as their weakest link. This is especially problematic when using third-party libraries, as any internal randomness or concurrency can break determinism. In practice, building a deterministic system often means reimplementing libraries or replacing significant portions of the runtime to ensure every aspect of execution can be controlled and replayed.
### Challenges of building an accurate simulation
FoundationDB, [spent years developing deterministic simulators that could faithfully model the real-world behavior of distributed databases](http://alex-ii.github.io/notes/2018/04/29/distributed_systems_with_deterministic_simulation.html). Will Wilson, who helped build FoundationDB, has said "if it doesn’t capture real-world complexity, you’re just moving the goalposts for testing" What he means is the benefit of DST is only as good as the simulator itself; if it fails to capture the true complexity and failure modes of the production environment, you risk missing critical bugs that only appear under real-world conditions

Simulators must model not just the “happy path” but also rare and catastrophic events: network partitions, cascading hardware failures, disk corruption, clock drift, and more. Achieving this can require deep domain knowledge, sophisticated modeling, and constant validation against real-world data. However, no simulator can perfectly mirror reality. Every model is a simplification, and even small inaccuracies in the simulation can lead to missed edge cases or a false sense of security.
### Do We Really Need Determinism Everywhere?
Personally, I tend to lean on correctness testing -- fuzz testing, property testing, and aggressive test coverage. Deterministic Simulation Testing (DST) is appealing, but it’s hard not to wonder if you can get most of the benefits from good fuzzing and property-based tests. The Go team, for example, has been skeptical of DST, with several arguing that it can lull developers into a false sense of security.

Will Wilson points out that the space of possible execution paths in any complex system is vast. DST is only as effective as the scenarios your simulator covers. In a way, you’re trading the challenge of capturing enough test cases for the challenge of building a simulator that can control the universe of possible cases.

The Go compiler itself is an interesting case: it must be deterministic, such that the same golang source files written by the programmer results in the same output machine code. The team uses aggressive testing to ensure that running the compiler multiple times on the same input always produces bit-for-bit identical output. Any deviation is treated as a major bug.
### AI might change the game
With the rise of Generative Agentic AI, we may soon see a future where the creation and maintenance of simulations are managed directly by AI systems. It’s possible we are moving toward an era in which a real world simulator—overseen and updated by artificial intelligence—has access to all errata and is aware of every conceivable edge case.

In such a scenario, the costs associated with building and maintaining highly accurate real-world simulations could be virtually eliminated. If this becomes reality, the barrier to adopting deterministic simulation technology (DST) may drop so low that the question will no longer be whether you use DST, but when you will start.
### Where Does That Leave Us?
So, do we need deterministic systems everywhere? Or can we get close enough with fuzzing, property testing, and aggressive test coverage? Is the extra effort of building deterministic simulators worth it?

How about I give you the principle engineer answer of, "It depends". DST is a powerful tool, but it comes with trade-offs. Predictability is wonderful, especially in tests, but sometimes, a little unpredictability might be what you want. The real challenge is knowing when to lean into determinism, and when to embrace the chaos.

References
- https://homes.cs.washington.edu/~mernst/pubs/determinism-icse2021.pdf
- https://journal.resonatehq.io/p/deterministic-simulation-testing
- https://www.polarsignals.com/blog/posts/2024/05/28/mostly-dst-in-go
- http://alex-ii.github.io/notes/2018/04/29/distributed_systems_with_deterministic_simulation.html
-  https://antithesis.com/blog/is_something_bugging_you/
-  https://www.risingwave.com/blog/deterministic-simulation-a-new-era-of-distributed-system-testing/
- https://github.com/golang/go/issues/33702