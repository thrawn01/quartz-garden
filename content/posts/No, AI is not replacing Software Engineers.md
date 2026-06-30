---
date: 2026-06-06
tags:
  - programming
  - design
  - ai
---

Every few weeks some AI trust me bro gets on stage and announces that software engineering is finished, or that they are shipping a thousand commits a day with AI, by simply orchestrating AI swarms and handing of all of software development to the artificial hive mind they have constructed. The machines can write code now, so the people who wrote code for a living are done for, and the AI is going to take over all of software development!

However, keen students of the software industry know that writing code was never the hard part to begin with, and the hard part isn't going anywhere anytime soon. So what exactly IS the hard part? Like most good ideas in software, smarter people than I figured out what the hard part is back in the 1980s. But before we get there, lets start my explanation with the timeless foundations of all software engineering.

## AI is the new Black Box
One of the oldest ideas in software is black box design and testing. (If you watch the [classic MIT SICP lectures from 1986](https://www.youtube.com/watch?v=2Op3QLzMgSY), this is the first thing they teach.)

The idea is simple. Something goes in, something comes out, and as a user of the black box you do not care what happens inside it. You give it input, you get output, and you can re-use that black box in your code to your heart's content. A good black box is deterministic, the same input gives you the same output, every time. It means you can *describe* what the box does without describing how it does it. **The description IS the contract.**

The usefulness of the black box holds only if the contract is solid. If the contract is deterministic and conveys acceptable side effects, the implementation should be disposable. You can ship a slow, obvious implementation first, then replace it later with something more optimized. A quality contract ensures that nobody using the black box has to know if the implementation changed, because the contract never changed. If you swap the implementation completely and not one user notices, you did the hard part correctly.

And because the box is deterministic, you can prove it follows the contract you defined during design. (In essence, you defined what "correct" means for the black box, even if you didn't write the implementation.) To validate the implementation is correct, you feed it inputs, you check the outputs against what the contract promises, and you know it's correct. **Not because you read the implementation**, but because you tested the box against its contract.

This is as true today as it was when people far smarter than me worked it out decades before most of us were born. So, let's put this old theory to work and see well this works in the age of AI.

## Defining the hard part
How hard can defining a contract be? Let's find out with a black box most of us have written a dozen times, a function that validates an email address.

We start by handing the AI a simple prompt.

`Write a function that takes a string and returns a boolean, the function returns true if the string is a valid email`

And here's the black box we get back. (We didn't specify a language, and I write a lot of golang, so it guessed golang.) Simple interface, no rocket science here.

```go
func ValidateEmail(email string) bool
```

Now according to the AI trust me bros, we shouldn't care about the implementation the AI wrote. We did our job. We defined the interface, we gave the requirements for what the box should do, and that's all we need, right? Coding is solved!

Let's take a look at the implementation anyway.

```go
func ValidateEmail(email string) bool {
    _, err := mail.ParseAddress(email)
    return err == nil
}
```

It looks convincing, solid and sensible. The `mail.ParseAddress` library function is exactly what most people would have reached for when implementing. However, in order to validate the contract meets our requirements, we need to "test" the implementation by feeding it a few addresses and see what "valid email" actually means to this function.

```
"steve@apple.com"                  → true
"betty+netflix@gmail.com"          → true
"Barry Gibbs <barry@example.com>"  → true
"root@local"                       → true
"user@localhost"                   → true
"!#$%@x"                           → true
```

Uh oh.... Depending on our use case, this might be exactly what we want, or it might be a security issue waiting to happen. Why? Because we never defined whether "well-formed" was the only thing we cared about. We gave no definition of "valid email", so the AI guessed. That's what generative AI does, it guesses at the next token, and its ability to guess correctly is directly correlated to its understanding. Part of what ALL coders must eventually learn to do is effectively communicate that understanding, without it, we, like the AI, are just guessing at the implementation without a full understanding of the problem domain.

So, in order to clearly define the problem domain, we have to understand what use case our black box will be put to. So let's define our use case as sending a newsletter to the provided email address.

We update our prompt with the new use case.

`Write a function that takes a string and returns a boolean, the function returns true if the string is a valid email, we will use this function to validate addresses people give us when they sign up for our newsletter`

So the AI now writes our black box with additional assumptions based on the usage criteria we provided. The code now rejects any destination with an IP address, and performs a DNS lookup, both reasonable guesses for a newsletter sign-up.

```go
// Reject IP-literal and local/non-public domains.
if net.ParseIP(domain) != nil { return false }
// Must have at least one usable mail host (MX, or A/AAAA fallback)
if mx, err := net.LookupMX(domain); err == nil && len(mx) > 0 {
```

But now our black box has unexpected side effects. The determinism we had is gone. Not only that, but if `LookupMX` can fail, our black box has no way to communicate the failure to the caller. Even if the DNS server isn't down, but simply slow, a timeout error becomes an "invalid" email address, indistinguishable from an address that was genuinely invalid. The interface which could carry that error is `(bool, error)`, but we only told the AI to return a bool. Our prompt conveyed the wrong shape of our problem, and what solving it would actually require. These aren't bugs to patch. Nothing is technically broken according to the requirements we provided. The black box does exactly what we asked it to do, we just never defined the constraints the implementation has to live within.

If we continue refining our requirements, and only accept an address a real provider like gmail will actually accept, then "valid email" might also require knowledge of individual email providers like gmail, or yahoo. As we have seen, the RFC allows plenty of addresses that providers might reject. In addition to the ones we know about, gmail reads the `+` in `betty+netflix@gmail.com` as an alias, and yahoo bans characters in the local part that the RFC allows. "Valid by the RFC" and "an address our provider will accept" are not the same thing, and which one counts as correct depends on the use case. The standard can't settle that for us, we as designers might not even know those constraints existed when we wrote our prompt! 

The hard part is exactly this, the complexity of this simple request "is this a valid email" balloons into a nearly unsolvable problem.

Every implementation the AI wrote was correct according to the specification (the prompt) we provided. This is exactly how AI slop is produced, we gave the AI a loose specification and it filled in the gaps with guesses, sometimes it's a good guess, some times its absolute AI slop cinema.

## You can only prove what you can test
**AI coding is, at it's core a validation problem**. How do we validate the black box which AI created for us is "correct"?  Unfortunately we can't apply mathematical proofs to most CS problems, because we rarely ever control the entire problem space, and the complexity of the entire system can't exist on a single sheet of paper someone can apply formal proof verification to. In our field, you can only "prove" what you can "test" about the problem space you control.

What we define as "correct" for our use case is almost always limited in scope. The Hard Part of our job as software engineers is to understand the problem domain by understanding the use cases, define the acceptance criteria, and limit the scope such that we can define what "correct" means for our implementation. Then we write tests (because we typically can't write proofs) to validate the implementation meets the criteria we have defined to the best of our ability.

Even if we simulate the entire world (for instance, simulate the DNS server) to "prove" the black box operates within our defined problem domain, the simulation is only as good as the creator. It can't simulate the unknowns which may exist outside of our knowledge when we wrote the simulator. (A bug in the DNS stack, etc..)

## Coding was always the easy part
Fred Brooks saw this in 1986. In an essay called ["No Silver Bullet"](https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf) he split software into two kinds of difficulty. There's the labor of writing the thing down, the typing and the syntax, which he called the "accidental" part of software development. And there's the difficulty of working out what the thing must do in the first place, what correct means, which he called the "essential" part. His point was that the essential difficulty is the real bottleneck, and no tool that only attacked the typing part of the problem could ever change that, in essence, there is No Silver Bullet in software engineering. Forty years later an AI does the typing for us, and he turns out to have been exactly right.

> With AI, writing the implementation is fast. Defining the problem domain, its scope, its use cases, its constraints, in essence what "correct" means, was always the hard part.

Spec driven development and Prompt engineering are the same thing. Every time you write a prompt you are handing the agent a specification of what you want built, how well you define that specification will determine in part, the qualities the implementation will take on. The other part is left to chance, which is why using AI can often seem like magic, because sometimes it guesses correctly, like pulling the handle on a slot machine, where the odds are not always in your favor.

## Developers still matter
Developers were never paid high salaries for typing at a keyboard. They are paid for the judgment that surrounded it. Deciding what to build, what "correct" means, where the boundaries go, which failure modes matter, how the thing survives contact with real users, and scales efficiently. The typing was just the visible part, the part that looked like the job because it was the part you could visibly measure as output. Take the typing away and what's left is still a highly skilled job. Incidentally, the output visibility is also why people see an AI write a UI in seconds and think OMG, UI designers are cooked.

**You can't outsource systems design to an AI swarm**. As we have seen, the AI can't even make good judgment calls when it comes to implementation! It currently can't see the vague "valid email" spec and, with years of experience behind it, push back on a bad design that doesn't fit the constraints, or avoid an implementation which makes the code non-deterministic to test, or realize the scope is too broad and make the wise judgment call. Instead, as of this writing (using Claude Opus 4.8), the AI will happily guess at an incomplete spec, instead of doing what a senior developer with years of experience would do, and push back on an incomplete or terrible design.

In the age of AI, the role of software engineer isn't disappearing. It moves up. The coder becomes a software engineer in the older, fuller sense of the word, someone responsible for the **systems design** and not ONLY the construction. And that pulls the job toward a place it's been drifting for a while anyway, which is the product manager's chair. Figuring out who the users are, what they need, what counts as done, these are PM questions, yet they're also developer questions. The two roles are converging, because the AI is slowly taking the one task that used to keep them apart, coding.

As I mentioned in my previous blog post, [[AI has not made software engineering easier]], as the age of AI continues, I believe that the AI industry will continue to chip away at these problems, and find better ways to define the hard parts, and constrain the implementation AI produces. Developing new languages where the oracle constraints are built into the language in ways developers never needed previously. Developing ways for AI to gain an intuition about the implementation they just produced, instead of simply guessing. But today, for all sorts of non-trivial level software, AI just isn't capable of replacing a senior engineer at the height of their craft. However, AI WILL continue to be a useful tool in making the easy part fast.

At Google I/O this year, they famously [spent 2.6 billion tokens](https://antigravity.google/blog/google-antigravity-built-an-os) and twelve hours of 93 parallel agents to have an AI autonomously write a bootable operating system, but I guarantee you, not a single dev at Google is suggesting they replace Android, or Chrome OS, or Linux with the AI written OS. Because they know.... typing the OS was the easy part, designing a good OS... that's the hard part.
