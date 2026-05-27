---
date: 2026-05-26
tags:
  - programming
  - design
  - ai
---

> I started this post as a reaction to the Bun rewrite from Zig to Rust, and the language wars that erupted in its wake. But that was just a pretense to talk about what I really want to discuss. We start with Rust, then get to the real discussion in the second half.

## Rust is a brick, not the building
Rust is a fantastic language. Zero-cost abstractions, memory safety, genuinely valuable ergonomics, an enthusiastic and growing community. None of that is in dispute.

But the constant insistence that everything must be rewritten in Rust, and that everything else is bad, stupid, or vulnerable, exposes a fundamental misunderstanding of how good systems are actually built.

As Joran Dirk Greef, founder of TigerBeetle, [put it](https://x.com/jorandirkgreef/status/2042601038348214458).

> A safe brick does not a safe building make.

Rust, like any language, is a tool. The fact that your program is memory-safe does not mean your software is correct, or that it is free of bugs.

## Good steel does not make a good car
This is the same fallacy as believing 100% test coverage proves a program correct. It doesn't. Coverage tells you which lines of code executed, not whether they did the right thing. I have personally seen software with 100% code coverage fail in production.

My favorite example is building a high-quality car. If you source the finest steel but put no real effort into systems thinking and design, you do not get a high-quality car. You get an unreliable car that happens to be made of good steel.

Good materials raise the ceiling on what is possible; but they are not a substitute for good engineering. Two cars built from the same grade of steel can differ enormously in quality, because systems design and integration matter more to the final product than the raw materials do.

## C has built some of the most reliable software in existence
C is, by any honest assessment, a dangerous language with many sharp edges, just like Zig. And yet it powers systems we trust with our lives.

The primary flight-control software of the Airbus A340 fly-by-wire system is roughly 130,000 lines of C, formally verified end to end with the Astrée static analyzer to mathematically prove the absence of runtime errors. Notice what made that software trustworthy. Not the language, but the verification engineering layered on top of it.

The Linux kernel is overwhelmingly C, though it now accepts Rust components too; a detail that itself argues against treating any single language as the answer. Most game engines are C or C++. Routers, HTTP servers, databases, and an entire class of systems that cannot afford to fail have been built in C and C++, and are extremely reliable.

## Rust's real win, and its limits
None of this means Zig, C, or C++ is "safe." Rust genuinely does eliminate most memory-safety bugs by construction, and that is no small thing. Memory-safety defects account for something like 70% of CVEs in large C and C++ codebases, according to data from Microsoft, Google, and the Chromium project. Eliminating that class of bug is a real, measurable win, and pretending otherwise would be dishonest.

But eliminating one class of bug is not the same as correctness. Rust software still has CVEs. Logic errors, mistakes inside `unsafe` blocks, denial-of-service bugs, supply-chain vulnerabilities in third-party crates. A memory-safe program can still compute the wrong answer, deadlock, leak sensitive data, or mishandle money.

The compiler that rejected your dangling pointer has nothing to say about whether your design was sound.

# The hard part of software was never the code
If a safe brick does not a safe building make, we should ask why our industry spends so much of its breath arguing about bricks. The language wars (Rust versus Zig, this runtime versus that one) have always been, at bottom, an argument about the writing code part of software, IMHO, the "easy" part.

## AI is making the easy part fast
For most of computing history, turning a design into working code was a labor (of love for many of us). It took skill, time, and a great deal of typing. AI is now very good at exactly that labor. It will produce idiomatic code in nearly any language you ask for; better in the languages it has seen the most of, weaker in Ada or Zig, but capable across the board.

A reasonable person _should_ look at this and conclude that the choice of language matters less than the outcomes it enables. But that is only half the story. AI has not made software engineering easier. It has made the easy part fast and left us with the hard part.

Fred Brooks named the hard part in 1986, in an essay called ["No Silver Bullet"](https://www.cs.unc.edu/techreports/86-020.pdf). He split the work of building software into two kinds of complexity. **Accidental** complexity is the labor of expressing a design; the typing, the boilerplate, dealing with syntax errors. **Essential** complexity is the difficulty of the design itself. Working out what the system must do, what "correct" means, which invariants must always hold, which failures are tolerable and which are not, and how to validate the implementation holds true.

>I believe the hard part of building software to be the specification, design, and testing of this conceptual construct, not the labor of representing it and testing the fidelity of the representation. We still make syntax errors, to be sure; but they are fuzz compared to the conceptual errors in most systems. -- No Silver Bullet

Brooks argued that no tool attacking accidental complexity could ever deliver an order-of-magnitude improvement, because the "essence" or design was always the real bottleneck. That argument now appears prophetic as AI is the most powerful attack on accidental complexity ever built, and yet we cannot go a single news cycle without hearing about how vibe coding has resulted in system failures.

According to Brooks, we must ask the essential question: given a program's output, how do you know it is correct? In testing theory, any mechanism that can answer that question is called an **oracle**. A test suite is an oracle. A formal specification is an oracle. A type system is an oracle. They all answer the same question with varying degrees of completeness.

## The borrow checker is a narrow oracle
Here is where the Rust advocates have half a point. A compiler that rejects your program because it is checking your code against a specification and refusing to proceed until the code conforms is an oracle. The borrow checker is a machine-checkable statement of exactly one property (memory safety), enforced on every build. In a world where a **machine** writes the code, an automatic check like that becomes more valuable, not less.

But much like all the other oracles mentioned, the check is narrow. Memory safety is only one invariant. A payment system must also guarantee that money is conserved, that an operation applied twice has the same effect as applied once, that some state transitions are simply illegal, that events are processed in an order that cannot corrupt the ledger. The compiler knows none of this. It will happily compile a perfectly memory-safe program that loses a million dollars.

Systems design, in an AI world, is precisely the work of building the rest of that oracle. Turning "correct" from a feeling in an engineer's head into something that can be validated.

## A powerful optimizer aimed at a weak target
This is where the vibe coders have it all wrong. Think of an AI coding agent as an optimizer. It optimizes for whatever oracle you hand it. Give it a thorough specification with a validation goal and it will satisfy that goal. Give it three shallow tests and it will satisfy three shallow tests; fully, quickly, and with code that looks right, reads plausibly, and is wrong in every way those three tests did not expose.

Writing with AI is [Goodhart's law](https://en.wikipedia.org/wiki/Goodhart%27s_law) with a jet engine bolted to it. The moment a weak measure becomes the target, a powerful optimizer will hit the measure and miss the point. In the old world, a weak test suite was a gap, and some bugs slipped through. In the new world, a weak oracle is an active hazard. Your AI is an infinitely patient, diligent, enthusiastic engineer who will deliver exactly what you specified, and fill in the gaps with what it does best, making guesses.

## Build the oracle, not the output
The obvious objection is that AI can write the tests, the spec, and the architecture too. It can, and you should use it to help refine those things. But a specification, a test suite, and an implementation all generated by the same system, with no independent check among them, are a very weak proof. That is the machine grading its own homework.

A correctness goal is only worth something if it is anchored to something the implementation cannot quietly redefine. Human intent. A property derived from the problem domain itself. A test against physical reality or a real downstream system. A type in a type system that encodes a genuine constraint. 

A more recent development is the idea that we can offload everything to a swarm of AI agents. While this can produce useful results, the route is non-deterministic, and full of guesses from multiple parties. Why choose an unreliable route when more deterministic oracles exist?

Now, there are times when we want to be very loose with our design, specification, and testing. During prototyping, for instance, a loose specification (simple prompt) and a collection of AI agent swarms making non-deterministic, educated guesses are a bonus, not a liability. When you are still trying to discover the problem domain and feel out the boundaries of your design, that AI guessing is a net positive, and you should lean into it during discovery, build something, get feedback, and iterate quickly. (I'm working on another post which explores this subject in more detail)

## Verification options are cheaper than ever
The methods that make correctness checkable (formal specification, property-based testing, model checking, deterministic simulation) have existed for decades. They were always the right answer. They were also, for most teams, too expensive to justify against a deadline.

AI changes that calculation completely. The same capability that floods you with plausible but wrong code, aimed the other direction, makes rigorous verification cheap for the first time in the industry's history. Writing a property-based test, a formal model, a fuzzing harness, a deterministic simulation — this is now fast.

TigerBeetle hammers itself with deterministic simulation testing. A harness that runs the system through millions of hostile scenarios and checks that its invariants hold in every one. That is what a real oracle looks like. And TigerBeetle is written in Zig; a little-known, not-yet 1.0 language that most engineers have never touched. Yet it has produced one of the most resilient and reliable databases of our modern era. The language was never the point. The systems design and subsequent validation techniques are what made TigerBeetle into something truly special. Zig was chosen because its guarantees aligned with TigerBeetle's system design goals, not the other way around. Greef [evaluated and rejected both Rust and C](https://tigerbeetle.com/blog/2025-10-25-synadia-and-tigerbeetle-pledge-512k-to-the-zig-software-foundation/) for design-driven reasons, and the design was [prototyped in Node.js](https://www.amplifypartners.com/blog-posts/why-tigerbeetle-is-the-most-interesting-database-in-the-world) before the language was ever settled.

The teams that win with AI will not be the ones with the fashionable language. They will be the ones who spend the gift of cheap code on building a verification harness that allows them to code fast and validate the correctness of the system. In the age of AI, the job of the developer is transitioning from coder to product designer and oracle creator.

## Review the oracle, not the code
Code review was built for a world where a human wrote the code and might have made a human mistake. You read the diff, you hunted for the missed error path, the non-idiomatic loop, the misplaced lock. That world is ending. When a machine writes the code, the diff will mostly look right, because looking right is the one property the AI is guaranteed to deliver. 

So stop reviewing the code. Review the oracle. The question is no longer "is this correct?" but "if this were wrong, would anything here catch it?" Which makes the oracle the thing actually under human review.

An oracle only enforces a definition of correct that the design handed it. What the system must do, which invariants must always hold, which states are simply illegal. So the review runs that chain backwards. Is the design sound, and does the oracle cover the whole of what the design demands of the code that changed? I've found that AIs tend to only test the parts that are convenient to check. This is where the real work in a review lies, and the only part a machine cannot do well. A flawless oracle bolted to an incomplete design still ships the wrong product, confidently. The gaps that sink you are the ones where the design demands something be true and nothing, anywhere, checks that it is.

I've had many discussions where we argue about "what is the purpose of a review?" In the age of AI, the purpose of the review is not "rename this variable" or "extract this function." The review is the work only a person who understands the problem can do. Checking whether the tests pin down the *right* answer or merely *an* answer, whether a guarantee the system depends on is actually asserted anywhere, whether a test genuinely constrains the code or just mirrors it back. And noticing when the spec, the tests, and the code all came from the same model in the same pass, aka vibe coding.

The senior engineer who built their identity on spotting a non-idiomatic loop is now just polishing the brick. The skill that's worth a salary is the ability to look at a passing build and a beautiful diff and ask the only question that still matters. What do these oracles *not* check?

Because that's where the bugs now live. Not in the code that failed the check, but in the space the check never covered. The better the oracle, the smaller that space, and the more correct, secure, and trustworthy the system becomes. We do not need more code review. We need more, and better, oracle review.

## The brick is nearly free
Anyone can have as many as they want, in any material, delivered instantly. That was never the hard part of building, and soon it will not be a part at all.

What remains is the building itself. The architecture, the problem domains, the honest knowledge of what must never fail and the means to prove that it doesn't. **That was always the job**. The language war was a long argument about the easy part. The sooner we admit that, the sooner we can start having the harder, better conversation.

A perfect brick is a fine thing to have. But it is still just a brick. Choose good materials. Then do the hard work of engineering the building.
