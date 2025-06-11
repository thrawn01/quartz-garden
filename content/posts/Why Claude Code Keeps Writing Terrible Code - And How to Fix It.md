---
date: 2025-06-11
tags:
  - programming
  - testing
  - artificial-intelligence
  - architecture
---
Think of Claude as a junior developer with savant-level skills. Sure, it might be possible to build a Slack clone in one shot, but like any junior developer, the underlying code architecture often becomes "AI slop." So the question is, how do we harness the AI savant, while avoiding the mess? Lets first address a limitation both AI and we humans share, but often don't appreciate enough.
## Reducing Context
LLMs -- even those with HUGE context windows -- can forget things, just like we do. It can struggle with complex contexts and can get confused when there's too much information to process. However, we can lean into this limitation, and use them to judge whether our code architecture is any good.

If Claude struggles to understand your codebase, your code base likely requires too much context for complete comprehension. This signals that your cognitive load is too high - both for the AI and for developers who will maintain the code. Even if the LLM can describe your code layout and the code structure if you ask it, you know it's struggling when you ask it to make a change, and it guesses incorrectly.

You can reduce the context needed by organizing your code into problem domains. Instead of grouping files by technical layers, group them by the problem domains they solve.

Think of it this way: when you're working on user authentication, you don't need to understand how the notification system works. When you're debugging payment processing, you shouldn't need to load the entire user interface into your mental model.

This separation means that AI (or we as developers) can focus on one domain at a time without needing to understand the entire system. When the LLM needs to modify the authentication flow, it only needs context about authentication-related files and interfaces.

The key is making problem domain boundaries explicit through your package or folder structure, naming conventions, and API boundaries. If your authentication code is scattered across dozens of files in different directories, the AI has to piece together the full picture from fragments. But if all authentication logic lives in a clear, self-contained domain, the AI can quickly understand what it's working with.

> None of this is new: "Problem Domains", "Component-Based Architecture", "Separation of Concerns" and "Single Responsibility Principles" have guided developers for decades. We just need to get AI in on the action.
## Tell Claude how to layout the code base
While prototyping a mobile chat application, I played with this idea. Instead of asking Claude to prototype the app directly as a one shot, I worked with it by asking follow up questions to design a project structure organized around problem domains: UI components, notification systems, configuration, and services first. Only after we had this organization in place did I ask it to design the UI, using the existing code layout I worked together with the AI to continue adding features.

```
prompt> Create a code architecture plan for the frontend. 
We will need a few different problem domains to handle the following.
- Interaction with the backend (REST Calls)
- Handling events that come from the backend
- Reuseable UI components
- Authentication
- etc...

prompt> Is this architecture typical of react typescript projects?

prompt> What about handling notifications? Part of the code base will
need to send notifications to mobile or web notification systems.
```

This problem domain based organization created smaller, focused contexts. Rather than the AI guessing where code should go (and often guessing wrong), it could follow a clear organizational structure. The result was cleaner code with lower cognitive load and less context needed to work within each problem domain.

I continued to ask the AI questions about the codebase layout for each feature added. When it could easily understand and navigate the structure, I knew we had succeeded in creating something maintainable.

Because of this experiment, I've started thinking about cognitive load and context windows as equivalent concepts. What creates high cognitive load for a human programmer also creates problems for LLMs. This insight should inform how we design our code architecture - not just for programmers' benefit, but for AI collaboration.

## AI as a Litmus Test
Using  generative AI's limited context windows as a feature, you can use it to test how intuitive your interface and API design is. When you create an API, give it to an LLM and ask questions about it. Ask if it understands how the API should be used. If it struggles or asks clarifying questions, your API might not be as intuitive as you thought.

Neon, a serverless Postgres provider, discovered this principle when building their MCP (Model Context Protocol) server. Initially, they exposed a generic "Run SQL" endpoint that handled both queries and database migrations. While this worked fine for the majority of human developers, LLMs consistently struggled to use it properly for migrations.

Their solution? They created a dedicated "migrations" endpoint - essentially an exact copy of the SQL endpoint, but with a name that clearly indicated its purpose. The result was immediate: LLMs could now understand the intent and use the endpoint correctly for database migrations.

This wasn't just about AI usability. The clearer, more intentional API design also improved the experience for human developers, resulting in a more intuitive (though admittedly redundant) API.

See this talk by David Gnomes https://www.youtube.com/watch?v=eeOANluSqAE

## Building for the AI-Dominated Future
Much like the "rock star" developers of the past who could write code like the wind, only to leave ungodly amounts of technical debt for us mere mortals to clean up. So two, the Junior Savants we call LLMs can generate a massive amount of SLOP for us to deal with once the prototype goes live.

As our industry becomes increasingly AI-driven, we need to build systems and organize code so that AIs -- and by extension, we -- can be productive. This allows us to move faster, develop quicker prototypes, and ship sooner.

When done correctly, designing for AI can result in better code, cleaner architecture, and more intuitive API designs for human developers.

The key is recognizing that good architecture principles remain the same whether you're optimizing for human or artificial intelligence: clear separation of concerns, intuitive interfaces, and minimal cognitive overhead.

The key here is to use AI as your architecture reviewer. If it struggles with your code, your colleagues probably will too.

