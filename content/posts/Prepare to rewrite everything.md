---
date: 2026-11-18
draft: false
tags:
  - programming
  - artificial-intelligence
  - architecture
  - testing
---
If you're trying to adopt AI, then you're going to have to rewrite everything.

Okay, I know that sounds crazy, but hear me out.

Tons of companies are attempting to revamp their entire engineering organizations to become AI-first. From my experience so far, most of them are spending all their time looking at lines written and agent workflows and completely miss what's important.

The new reality is that every company that can afford an AI bill now has access to hundreds of thousands of developers like Google does, and they're expecting to build software as fast as Google does, but with none of the software guardrails that Google has developed over decades so that their interns don't take down systems that billions of people rely on! What [Software Engineering At Google](https://abseil.io/resources/swe-book) teaches us about writing quality software at scale is now important to everyone, not just Google.

## Your codebase isn't ready for AI
The cold hard truth is that an agent doesn't know which parts of an old repo are intentional design and which parts are compromises and tech debt. Lauren Tan (@poteto) explains this perfectly in her talk [All Code Is Slop (Except Mine)](https://www.youtube.com/watch?v=O_zcc6Xl12g), where investing in her agents' environment let her ship 3,000 pull requests to production in one month. The point she made really resonated with what I've seen in my own agentic journey. Your codebase is the largest input an agent gets, so all the workarounds, anti-patterns, and deprecated code left inside it is "likely to be just copied by the next agent since it looks like the established pattern in your codebase." This means all of that garbage humans have history sifting through, is going to get propagated throughout the codebase at agentic speeds.

In [its 2026 engineering report](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways), Faros AI analyzed telemetry from 22,000 developers, comparing each organization's lowest and highest AI adoption periods. Bugs per developer rose 54%, and incidents per merged pull request rose 242.7%. Even high-performing organizations with mature DevOps practices and disciplined delivery processes saw the same downstream deterioration. In [a 2026 study of 806 open-source repositories](https://arxiv.org/abs/2511.04427) that adopted Cursor, Carnegie Mellon researchers found lines added up 281% in the first month, with the velocity gain fading after two months while code complexity remained 41.6% higher.

If you think you can just use review as a way to control the deficit rate, think again. Code review is just not enough to keep up with the rate of change that AI agents can produce. Median time in review rose 441.5% in the Faros telemetry, and pull requests merged without any review, human or agentic, rose 31.3%. AI can 2X or even 10X developers, but it will not fix your broken SDLC. Companies struggle because they DO NOT know how to build quality software at SCALE, and NOT because their developers are not typing fast enough.

## Cleaning up old code means rewriting it

The path to quality and security is automation rather than more human oversight, blocking bad agent code the same way bad human code gets blocked without waiting on another person to notice hidden issues in code. This is the same formula large companies like Google do it today.

But you don't have to be Google, the way Lauren's team reduces the dependency on the review process over time was by following a general principle that every correction given to an agent becomes a deterministic check such as a lint rule, or a change to the API or architecture that eliminates the problem. Once she had confidence these sorts of mistakes were not going to happen again, it allowed her team to scale up the rate of change to the tune of 11,000 pull requests to production in one month with reverts holding steady at about half a percent. All of this while code review shrank to inspecting verification artifacts such as videos, screenshots, diagrams, and formal verification.

Google has been running a version of this playbook for years through Tricorder, the static analysis platform documented in [Software Engineering at Google](https://abseil.io/resources/swe-book/html/ch20.html). Tricorder includes more than 100 analyzers (most contributed by engineers outside the Tricorder team), paired with compiler checks and custom presubmit checks to catch anti-patterns automatically, allowing "more expensive processes (such as human review and testing) to focus on issues that are not mechanically verifiable."

Existing automated checks block new mistakes from merging, but the existing workarounds already in the repository stay there for the agents to copy. You clean these up by adding lint rules to prevent new occurrences of anti-patterns and then clean up those old patterns as you go. In a codebase written before agents existed, those old patterns are most of the code, so cleaning them up is most of the rewrite work.

Don't think just because you have agents to do the work, this is going to be easy! It took Lauren six months of investing in her agents' environment before she had the confidence to ship thousands of pull requests. THAT and she had the advantage of working on a product whose framework her team created with those constraints built in.

On my own projects, I spent months curating my repositories to avoid bad behavior and encourage great outcomes, and all of that work is slowly starting to pay off. I'm merging more pull requests than ever, with high confidence that nothing is broken. But I want to go even faster, while still maintaining confidence, and that's  why I'm working on my own version of Tricorder called [tiger](https://github.com/kapetan-io/tiger), a static analysis tool enforcing TigerBeetle's TigerStyle and NASA JPL's Power of 10 rules for safety-critical software. (go check it out, tell me what you think)

### Use AI to rewrite
A developer with agents can easily write 5,000 lines a week, and a skilled one can write five to ten times that. In the seven days before I wrote this, I merged 27,600 lines into my own projects. A hundred developers at the lower figure produce 2 million lines a month, and at my rate roughly 12 million. Output at that scale makes replacing an existing codebase practical, though not always easy.

In [his GOTO Copenhagen 2026 talk](https://www.youtube.com/watch?v=ciRTdOIhNCc), Adam Tornhill, founder and CTO of the code analysis company CodeScene, points out that legacy code and technical debt will bottleneck enterprise adoption of agentic coding, and that the uplift can and should be done with agents gated on an objective measure of code quality. To exemplify this, two of his colleagues refactored the 25-year-old, 300,000-line C codebase for Street Fighter III, bringing every application file to a perfect 10 on CodeScene's 10-point Code Health scale in less than a week for roughly $4,000 in API token costs. 

## Quality must come before speed

Before starting the rewrite, Tornhill's colleagues spent roughly two weeks defining the process, testing models, and getting automated tests running. They paired CodeScene's Code Health checks with a replay trace harness that hashed frames to **verify identical behavior**, and had the agent build a refactoring playbook as it went. Every company trying to adopt AI on a legacy codebase faces that same prerequisite. A rewrite is safe only where the old behavior survives the rewrite (or if you want too be generous and not freek out leadership call it a "refactor") unchanged. 

Agents improving a codebase with an automated quality and behavior suite raise its quality, while other agents work on cleaning up all the bad patterns and inconsistencies littered through the codebase. Getting on the right road without increasing slop rests on three disciplines baked directly into the codebase.

- **Consistent patterns baked into the code.** Solving boring problems once, the central idea behind [[Solve Boring Problems Once, Then Stop Solving Them]], gives agents an established pattern to follow instead of reinventing the wheel on every task, backed by deterministic checks that enforce the rules automatically.
- **Testing at scale and verification skills.** Deterministic, behavior-based surface tests prove whether an agent broke the product while internals move underneath, paired with runtime and formal verification skills so agents validate their own work before a human ever looks at it.
- **Architecture, decoupling, and context.** Clear module boundaries, observability, and tight context management let agents work in parallel without colliding and catch defects in design where they happen.

Adopting agents at scale is possible, but your first step MUST be to build quality and verification into the system. The problem isn't how to 10x your developer productivity, it's how to avoid creating 10x the tech debt. The large software houses solved the quality problem at scale years ago, now it's time for everyone else to follow their example.