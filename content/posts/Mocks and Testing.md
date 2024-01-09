---
date: 2011-05-25T00:00:00Z
tags:
  - programming
  - testing
---

I just spent the last 30 minutes debugging a mock object. I was running unit
tests through the debugger and inspecting the objects I thought the code was
calling. To my surprise this well-defined well-used object was returning an
un-expected result in the tests. Only later did I realize the test wasn't
calling the real object. It was calling a mock, and the test writer had
incorrectly defined the mock result.

This illustrates why I think isolation testing with mocks can lead to a
misplaced sense of code coverage. Lets look at some code so I can explain.

Consider the following

``` java
RequestContext target = mock(RequestContext.class);
when(target.getParameterNames().thenReturn( new String[]{ 'marker' } ));
when(target.getBaseUri()).thenReturn(new IRI('http://localhost:8080/atom'));
when(target.getTargetPath()).thenReturn('/foo/bar?marker=1');
```

Since we don't have access to a real RequestContext() it makes sense to mock
this out. Its only when we actually deploy our application do we realize the
subtle errors here.

The actual call to `target.getBaseUri()` returns
`http://localhost:8080/atom/` instead of `http://localhost:8080/atom`
In addition, this bit of code `target.getTargetPath()` returns
`'/foo/bar?marker=1'` instead of `'/foo/bar'`

Both of these issue are impossible to detect without actually running your code
with a real request that returns a real RequestContext().

This illustrates the biggest downside to using mocks for testing. When you isolate
a test with mocks your almost guaranteed your classes are going to pass the
unit tests because you are in complete control of the inputs your class is
subjected too. In a real world application this is simply not true.

One of the values of good testing is to validate the class works within
a certain context. By separating your classes from the context they run
in; you completely negate a huge benefit to code testing.

### The need for functional tests
In contrast to isolated unit tests, functional tests exercise your code with a
real world context.

Functional tests have the following benefits

1. Broader strokes of code coverage
2. Tracing errors with a debugger can be much faster than sorting through unit
tests guessing what part of the system is acting up, and tweaking unit tests
3. Users can submit inputs that cause the error, which can and should be easily
turned into a functional test.
4. Confidence your application delivers the service it was designed to provide.
The user -- and by extension you -- don't care if all the classes work as
expected in an isolated environment. They do care if your application provides
the functionality promised.

Don't get me wrong I'm not anti mock. I just don't subscribe to the notation
that EVERY class must have an isolation test. Using a mock; like any good tool
-- at the right time and for the right purpose is important. Many of the
classes we write are better served in a functional test. We still get the same
code coverage, and the test is less fragile.
