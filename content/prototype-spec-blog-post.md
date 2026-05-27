DRAFT

# The Prototype Finds the Interface

TODO: Mention the "Silver Bullet", where Brooks talks about using prototypes as a way to help define the spec.

Ronan Berder [posted on X](https://x.com/hunvreus/status/2056742771386638454), referring to AI development;

> Why on earth would you want to revert to Spec-Driven Development?

It's a recurring argument that spec-driven development is a step backward. Agents write code faster than ever, humans are decent at systems thinking, but we are genuinely bad at planning. 

Any experienced engineer knows you cannot sit down, write a complete spec, and then implement software that matches it. Not if you want the result to be good. You have to work through the problem to understand its boundaries, you do that effectively by writing a prototype.

You lean on the fact that code is now cheap. Prototype, document what you learned, rewrite, document the solution, refactor, repeat. That argument is half right. And the half it gets right matters enough that I want to defend it before explaining what it misses.

## Prototyping is product discovery
Spec-first-from-scratch is typically not going to result in the outcome you desire. The entire history of software engineering is a monument to this fact; very few people write a spec, build it, and ship a great product the first time. You learn the problem by building, not by writing a spec.

What changed with AI is not that planning got easier. It's that iteration got cheap. The cost of building a prototype, throwing it away, and building another one has collapsed toward zero. That is the actual unlock, and the prototype-driven crowd is right to seize on it.

But it's worth being precise about what the prototype is *for*. Its job is **product discovery**. You are validating that the problem is real, finding the domain, the definitions, the boundaries, the right primitives, the shape of the surface that the rest of the system will be built against.

For an API product, the interface *is* the product; these two things collapse into each other. For an end-user product, the interface is the layer between what the user sees and what the system does. Either way, the prototype is how you discover it.

You rarely ever arrive at the right product by simply thinking about it. You arrive by building the wrong thing a few times until the shape becomes obvious.

## Where the loop breaks down

So far, no disagreement. The break comes after the prototype has done its job. Once you have a product definition, a domain language, a scope, and a sense of the interface, the prescription to keep documenting and refactoring *the prototype itself* stops being a shortcut and becomes a trap.

**Your early assumptions survive the refactor.** A prototype encodes your wrong guesses right alongside the good ones. That's fine; that's what it's for.

Because AI makes code cheap, you really aren't losing anything by throwing away the prototype. The PRD and Spec are your chance to design the code for the thing you discovered during prototype phase.

The alternative is iterating on the prototype itself, and that's where things go wrong. AI will tend towards pattern matching existing code, so each refactor inherits the prototype's mental model. You end up mirroring the assumptions you held *before* you understood the problem, instead of building from what you know *now*.

**The interface is where the 1000x lives (and the prototype is what reveals it).** Joran Greef makes this case in his talk [1000x: The Power of an Interface for Performance](https://www.youtube.com/watch?v=yKgfk8lTQuE). The payment switch he was profiling (Mojaloop) issued 10-20 SQL queries per financial transaction, holding row locks across network round-trips. It topped out at 76 TPS on NVMe storage. 

His fix wasn't Zig, io_uring, or any low-level trick. He made debits and credits a first-class primitive in the database interface ([TigerBeetle](https://tigerbeetle.com)), batched up to 8,190 transfers in a single 1 MiB query, and throughput jumped to 1,757 TPS. Same hardware. Different interface.

The largest performance gains don't come from optimizing code. They come from designing a system around an interface that respects the physics of the hardware. Batching, the right primitives, locality. These are design-time decisions, and you cannot make them by profiling a prototype.

Here's the part the prototype-only crowd misses. This is not a phase competing with prototyping. It's *enabled* by it. The prototype's deepest output is not code; it's the interface.
(The very first prototype of tiger beetle was written in nodeJS)

The spec is where you build a system that cashes in on that interface. Skip the prototype and you spec the wrong interface. Skip the spec and you ship the right interface buried in ten thousand lines of throwaway scaffolding, and you miss out on good code architecture.

### Words Are Cheaper Than Code.
Iterating on a 500-line tech spec is trivial. You can restructure the whole architecture in an afternoon, before a line of production code exists. Using the excellent [`/grill-me`](https://github.com/mattpocock/skills) skill (or similar tools) is a great way to find the edge cases in your design and code architecture before the code starts having an opinion.

Iterating on 10,000 lines of half-baked, partially-correct, LLM-generated code can lead to code surprises. The spec is simply a cheap surface on which to have your architecture arguments.

Refusing to write one doesn't make the decisions go away; you are just outsourcing those decisions to the AI. It will have to make those decisions during implementation, and it will make them without the context you have.

**The prototype doesn't care about code architecture. The spec is where you finally do.** During product discovery, you shouldn't be thinking about how the code is organized. You're just trying to learn. That's the whole point.

But when you're ready to build for real, code architecture is everything. It's what determines whether the system scales, whether the team can maintain it, whether new features take a day or a month.

The tech spec is where you codify those decisions. Module boundaries, data flow, separation of concerns, the abstractions that will carry the system forward.

Skipping the spec means you inherit whatever architecture the prototype happened to accumulate along the way. That's not an architecture; it's an accident.

## The Workflow So Far
None of this is an argument against prototyping. It's an argument that prototyping is just one phase of the workflow, not the entire workflow.

**Prototype.** Discover the interface. Move fast, throw code away, build domain knowledge. The output is not the code. The output is the shape.

**PRD.** Lock the product definition, the domain language, the scope. Now you know what you're building.

**Tech Spec.** Design the system around the interface. Architecture, performance constraints, the real abstractions. Do this in writing, where changing your mind costs a few lines on a page, not a messy refactor.

**Implementation Plans.** Break the spec into agent-executable work. This is where cheap code re-enters the picture, but now it's building toward a known architecture instead of guessing at it.

The instinct to keep iterating on the prototype is a fear of "wasting" it. But in the age of AI, starting from scratch is cheap.

The prototype already delivered its value the moment it revealed the interface. Rewriting from a clean spec isn't waste; it's leveraging the speed of AI to make a better product.

## Conclusion
The mistake in the anti-spec argument is treating these as competing philosophies where embracing one means rejecting the other. They aren't competing. They're sequential.

The prototype answers *what are we building, and what's the right shape for it?* The spec answers *how do we build a system that cashes in on that shape?* Skip the prototype and you build the wrong thing well. Skip the spec and you build the right thing badly.

The point of cheap code isn't to never plan again. It's to finally know what to plan.
