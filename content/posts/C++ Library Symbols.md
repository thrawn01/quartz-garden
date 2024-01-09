---
tags:
  - programming
  - cpp
date: 2008-03-25T00:00:00Z
---

I've looked up this information enough I need to keep it in a place I will not
lose it.

To get a list of all the C++ symbols in a dynamic library use 'nm' command. You
can get a demangled listing of the symbols by using 'nm --demangle'

Output
symbol types: each symbol type is shown by a letter. If the letter is
lowercase, the symbol is local. If the letter is uppercase, the symbol is
global ( external )

nm - lists symbols from object files for each symbol the following is displayed:

 - the value in hexadecimal
 - the symbol type
 - the symbol name

