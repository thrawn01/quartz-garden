

I have a story, about writing great functional tests and the power of.... which I should also write an article about some day. But here is the TLDR; I wrote a custom MIME parser for Mailgun. (Why? Thats a different story) It was a CORE piece of our stack, used in multiple services all over the system. 

We had a junior dev (3 year exp) join our team of senior devs, and I put him on adding a feature to the MIME parser. He was horrified, he didn't want to mess it up. I told him, "you got this". I had confidence he couldn't break anything, because at that point, we had well over 250 FUNCTIONAL tests which ensured the code was functionally sound. (Not a unit test in sight).

I wrote the parser as a recursive decent parser, so he learned all about them in short order. His first PR, changed some of the existing tests. I said "what is this?" - pointing to the changed tests, he said he couldn't make it work without changing the tests, I said "imagine these tests are immutable, and you can't change them, you can only add to them, now go try again". and he did! he had to re-write even more of the parser to get his changes to work, and it made him so nervous about the change. He came back with his second PR, no test changes, he added another 15 tests to the suite, after we discussed it, and then he deployed it to all the services that used it.

Not a single bug or failure after deployment. He was beside himself with joy, In all of his 3 years, he had NEVER deployed anything that didn't have a bug in it. I asked him why he thought the code he deployed didn't have any bugs. He said, because the project was so well tested. I said, I agree, but our code coverage says we only have 80% test code coverage, why were we still so successful? "Functional tests" he said, and he was right. 

He was all about functional testing after that, and was one of our top performers. 

