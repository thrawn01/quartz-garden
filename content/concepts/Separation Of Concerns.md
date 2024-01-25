---
tags:
  - programming
  - thoughts
  - design
date: 2024-01-12
---
Imagine you have a program which has been released. A customer comes along and offers to pay you for a enhancement to one of its features. In order to get the money, you will need to change your program to add the new feature. Some of the things that will influence what your profit margin is are:

1. How much code you have to change
2. How easy it is to make the changes
3. How likely you are to break existing features that are being used by other customers
4. How much you can reuse you existing model/architecture

In more concrete terms.

1. If all of the code for a particular behaviour of the application is separated out, then you will only have to change code directly associated with your new feature. Which should be less code to change.
2. If the behaviors you are interested in are neatly separated from the rest of the application it is more likely you will be able to swap in a new implementation without having to fully understand or manipulate the rest of the program. It should also be easier to find out which code you need to change.
3. Code that you do not have to change is less likely to break than code that you do change. So splitting up the concerns helps you to avoid breakage in unrelated features by preventing you from having to change code that they could call. If your features are mixed up together you might change the behavior of one by accident while trying to change another one.
4. If your architecture is agnostic to technical or business logic detail then changes to implementation are less likely to require new architectural features. For example, if your main domain logic is database agnostic then supporting a new database should be as easy as swapping in a new implementation of the persistence layer.

TLDR; Separation Of Concerns is a corner stone of [[Clean Code]]

This page was taken from this [stack exchange question](https://softwareengineering.stackexchange.com/questions/32581/how-do-you-explain-separation-of-concerns-to-others) and is the simplest and most concrete way of explaining this principle I've found. Thank you [flamingpenguin](https://softwareengineering.stackexchange.com/users/5404/flamingpenguin) who ever you are.

