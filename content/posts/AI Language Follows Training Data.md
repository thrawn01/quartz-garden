---
slug: ai-lang-follows-training-data
date: 2026-05-02
draft: false
tags:
  - ai
  - agentic
  - skills
---

I've recently discovered Matt Pocock's excellent skills repo https://github.com/mattpocock/skills.

Then I saw a post from Matt discussing the merits of establishing common definitions for the model to use. I began to wonder if instead of trying to dictate definitions for the model to use, our skills should use definitions that closely align with the model's training data.

So, I started a new session, and explained my goal to Claude. I asked it to assess my functional-testing skill — specifically whether the word "functional" aligned with its training data, or if it might lead to confusion for AIs using the skill.

To my delight, it clearly explained why "functional" might cause confusion based on training data, and provided some additional references which collide with "functional" as a definition for what "functional testing" is. After some conversation, we settled upon "surface" instead of "functional" to describe this style of testing. Armed with this new information, I renamed the "functional-testing" skill to the "surface-testing" skill, and then because I'm me, I asked the AI if the skill instructions aligned with its training data, and proceeded to rewrite the entire skill from scratch, and I'm very excited about the outcome!

However, I couldn't ignore the fact that Matt uses the "seam" _(from Michael Feathers)_  in his improving architecture skill https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/LANGUAGE.md So I opened a new context window...

```
> load the "surface-skill" and lets have a back and forth discussion on the
> merits of the name "surface", compared to "seam" which was coined by Michael
> Feathers.

⏺ Good — let me kick off the discussion.

The case for "surface" over "seam":

Feathers' seam is specifically about where you can alter behavior without
editing that place — it's a leverage point, not necessarily the outermost
boundary. Seams can be internal: link seams, object seams, preprocessor seams.
The whole point of Feathers' seam concept is to find any place you can insert a
test hook into legacy code, including deep inside a system. 

The (surface-testing) skill's concept is deliberately more constrained: it's
not just a boundary, it's the outermost boundary — the thing users actually
touch. 

"Surface" carries that spatial meaning naturally. You don't go beneath the
surface; you interact with what's exposed.

So the argument is: these are actually two different ideas, and calling the
skill's concept a "seam" would blur that distinction. Feathers' seams are tools
for getting legacy code under test by any means necessary. This skill's surface
is a constraint that says even if you could enter internally, you shouldn't

My honest take: surface is the better name for this philosophy because it
describes where tests should live, not how to break dependencies. "Seam" would
be accurate but would invite confusion with Feathers' specific usage.
```

I cleared the session, and ran this prompt a few times, with similar results. A strong indicator!

Next I followed up with
```
> Let's discuss if we should use "seam" inside the skill to align with training
> data in those cases where the AI needs to discover an internal testing
> surface. eg: There may be some internal packages which are intended to be
> used by the coders as if they were external libraries which solve a complete
> problem domain. Would using the term "seam" with a clear reference to Michael
> Feathers trigger neural paths in the training data which may align the skill
> to training data?

⏺ This is a sharp observation, and I think you're right — but the mechanism deserves 
careful examination.

Yes, vocabulary activates training data associations. When an LLM reads "seam
(Feathers, WELC)" it doesn't just parse the definition you provide — it also
weights associated concepts from training: substitution points, interface
boundaries, dependency inversion, clean separation of concerns, testability by
design. 

That's a rich cluster. You get those associations for free by naming the term correctly. 

-- snip --

The risk is the legacy connotation.

Feathers' seam concept in training data is almost always paired with legacy
code rescue — the problem of getting untested, tightly-coupled code under
control by finding substitution points. That's a specific tactical context. If
you reference Feathers in the skill, the model may correctly understand
"internal boundary where behavior can be substituted" but it may also pull in
the surrounding context: dependency-breaking as the goal, internal surgery as
acceptable, seams as places to wedge mocks in. That's the opposite of what this
skill is trying to encode.

```

After further back and forth, we abandoned "seam" and instead settled upon "internal library boundary"

```
> As an example, a package which writes an sstable could be a standalone
> package which exposes a read/write interface. But would likely never be
> substituted via DI during testing.

⏺ You're right, that rule was overgeneralized. The SSTable example exposes it
clearly: a self-contained package with no external dependencies should just run
for real in consumer tests — substituting it would reduce fidelity, not
increase it.

-- snip --

So the DI substitution line should be dropped entirely from the definition. The
concept stands on two simpler rules:

▎ An internal library boundary is a package with a complete, self-contained API
— structurally identifiable by whether it could be extracted and published
independently without changing its interface. In all contexts — design,
implementation, and review — recognize or introduce these boundaries at domain
edges and test each through its own exported interface only.
```

Now that we have our definition aligned with the training data, I worked with Claude to make edits to the skill.

### What I learned
- The terms "seam" and "surface" are complementary, not competitive
- The AI does appear to have clear understanding of how words align to training data

You can find the completed skill in my [little claude dot files repo](https://github.com/thrawn01/claude-dotfiles/).

