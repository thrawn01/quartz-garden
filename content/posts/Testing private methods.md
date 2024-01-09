---
title: Never test private methods
date: 2017-02-06T08:11:27-05:00
slug: never-test-private-methods
tags:
  - golang
  - programming
  - testing
draft: false
---

Traditional software development disciplines teach us to control public
functions and interfaces exported by our code. As the exported code forms what
is known as the public surface of the code package. It is through this public
surface that we proclaim to our users which interfaces and functions are
available for use.
<!--more-->

Making an interface public proclaims two things
    1. The interface is well tested and approved for use.
    2. The signature of this interface is guaranteed not to change for this major version.

Good developers who are cognizant of their public surface usually write new
functions private first, and are very explicit in exposing only a subset of
functions public. Developers new to golang and which fall into this category
are often appalled to discover they are unable to access these private
functions when writing tests using the built in **_test** package. The typical
response is to place the public test functions in the main package, and avoid
the **_test** package all together. The result is a littering of the public surface
with hundreds of test functions! Precisely opposite of what we wanted to
accomplish in making our functions private!

So what are we todo?

We get clues by examining the golang standard library. Take the golang standard
**fmt** package as an example. It’s public surface is very clean and well tested
with 36 tests in the **fmt_test** package. Yet closer inspection reveals many
private functions of varying degrees of complexity within the package! How does
a package as well tested and widely used as **fmt** get away with zero tests on
private functions? The answer might surprise you, as this simple rule is one of
the hallmarks of great software design and good testing.

## Only test the public surface
One of the promises of the public surface is that the interface is well tested,
as such; the public surface should be the focus of all our tests. If the public
surface exercises all possible execution paths within our public and private
functions no private function testing is required. With thorough test coverage
of the public surface, all possible code paths can be covered.

Put another way; if you’re testing private functions, you’re breaking the rules
of encapsulation. If you are unable to test all code paths in a private
function, it instead should be a public function, as private functions form the
core of the encapsulation and should only provide code paths that satisfy the
public surface needs. No matter how many ways you say it, the result is the
same. Testing private functions defeats the purpose of encapsulation.

## More work and less benefit
When writing private functions first; good practice is to write tests for the
private functions simultaneously. This can result in less rigorous testing of
the public surface, as the developer might reason “the private function is well
covered, no need to duplicate the same test for the public function”, or at
best the developer duplicates testing for both the public and private functions
resulting in more work now, and in the future.

Recently I saw a pull request where the developer moved the existing tests out
of the **_test** package and into the main package so he could add tests for a
private function. He then neglected to add the same tests for the public
function. This could not only leave a gap of untested code in the public
function but also breaks encapsulation. Causing headaches for future pull
requests that don’t realize the testing gap or that now have to deal with a
tested private function that should have been a detail of the encapsulation,
but is now apart of the testing suite.

Because the function is now apart of the test suite future code changes are
likely to avoid removing it or changing it’s signature even if is in the best
interests of the code base, purely on the basis that the function is already
well tested. If changes **must** be made to the private function; the developer is
forced to update the tests for the private function instead of testing the
thing that actually might be affected by the change, the public surface.

If the initial developer correctly tested the public surface first, future pull
requests should be judged successful if the public surface tests pass,
regardless of what private functions were modified. As long as all code paths
within the private functions are covered, the pull request can be judged a
success. By following the “test public surfaces only” rule we can avoid extra
work in the future, increase the amount of code covered and reduce test
overlap.

## How do I ensure my private functions are covered?
To ensure our public surface tests cover all our private functions, we can use
code coverage tools. golang comes with a built in code coverage tool to
identify un-exercised code paths. For example, we can see all the test coverage
for private functions in the **fmt** package by running the following in a
terminal. (See **fmt/format.go** which contains many of the private functions)

```
 $ go test -coverprofile=coverage.out fmt
 $ go tool cover -html=coverage.out
```

This tool or one like it should be an important part of any CI setup.

## How do I avoid crowding the public surface?
Inevitably you will write some general interfaces which are useful to many
parts of our code, but are not strictly apart of the public surface you wish to
present. These interfaces are perfect candidates for placement in a
sub-package. In this way we create a testable public interface for our private
code to use, but which is not strictly apart of our main packages public
surface. golang supports sub packages naturally and can be a strong indicator
to users which interface surfaces are specific to our package.

```
  github.com/thrawn01/package
  github.com/thrawn01/package/utils
  github.com/thrawn01/package/db
```

`go doc` supports this naturally by generating documentation for the current
package and ignoring sub packages unless specified directly. Granted this does
not keep users from using the sub package interfaces; but the generated go docs
can help steer users toward the correct interfaces.

A feature added in golang 1.5 is to name the subpackage
**github.com/thrawn01/package/internal** which disallows external code to
import the subpackage **package/internal**.

## How do I know what interfaces to make public or private?
In general, functions and interfaces which are tightly coupled to the calling
function are good candidates for privatization; all others should be public.

When deciding if a function should be private or public it can be helpful to ask the following.

 1. Is this function generally useful in other parts of the code base? (make it a public/sub package)
 2. Could this function be useful to others? (make it a public/sub package)
 3. Is this function tightly coupled to the package? (make it private)
 4. Can all code paths be covered by testing the public interface? (If yes make private else public)

## Conclusion
Separation of package code and package testing is a wonderful feature of golang
which forces the developer to make sound choices about how their package is
used and tested. Over my many years of C++ and Java development I can’t tell
you how many times I’ve come across useful and reusable code that was
thoughtlessly left private and thus inaccessible. I’ve been at companies where
entire classes were copied 10+ times in different locations of a vast code base
because the original author never imagined the class would be useful to any one
but himself. Because of this, I write my code public first and make thoughtful
decisions about how my code is used.

My hope is that this post will encourage others to make their code public
first, use the golang **_test** package, and encourage more code reuse.