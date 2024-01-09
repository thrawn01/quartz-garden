---
date: 2007-12-27T00:00:00Z
tags:
  - programming
  - cpp
---
An interesting problem I ran across on a 
[blog](http://ariya.blogspot.com/2007/11/random-number-15-to-17.html)
the other day.  Quote from the blog....

Given a function which produces a random integer in the range of 1 to 5, write a function which produces a random integer in the range of 1 to 7 This is well-known as one of the so called Microsoft/Google interview questions. There are million ways to solve it.

So here is my Take on the solution.
``` cpp
int rand7() {return 7 / rand5();}
```
You will only get 1 2 3 or 7 using this solution, but the requirements didn't
call for uniformity. More uniform would be
``` cpp
int rand7() {return (( rand5() + rand5() ) % 7) + 1;}
```
A friend of mine was confused with the modulus '%' in this function. The modulus returns the remainder of a division operation. The remainder of a division can never be greater than the dividing number ( in this case 7 ) which means % will always return a number between 6 and 0 ( 0 ... 6 ) which is also why we add a +1 to the result to get 1 thru 7
