---
date: 2007-12-19T00:00:00Z
tags:
  - programming
  - php
  - cpp
---
I've been living in the land of PHP for so long I have forgotten the basics of
pointer arrays and types. For instance this one threw me a loop today.

``` cpp
environ = (char**)malloc(env.size()+1);
count = 0;
for( list::iterator i = env.begin(); i != env.end(); i++ ) {
   environ[count++] = strdup((*i).c_str());
   cout << "environ[0]: " << environ[0] << endl;
}
```
While loading up the environ array I noticed corruption line gave me
``` cpp
environ[0]: =/usr/bin/;/usr/local/bin
```
I also noticed each iteration of my array loading was creating even more corruption on an increment of 4 bytes each. So that when the array was fully loaded environ[0] was completely corrupted. This totally threw me. On a whim I threw away the malloc and replaced it with
``` cpp
environ = new char\*[env.size()+2];
```
and the corruption went away. It was only then I realized what I was doing wrong. I Changed
``` cpp
environ = (char\*\*)malloc(env.size()+1);
```
To 
``` cpp
environ = (char\*\*)malloc((env.size()+1) * sizeof(char\*\*) );
```
And all was well. You see malloc returns a void* which is just an 8 byte pointer, But not all types are just 8 bytes, so you have to allocate not only the number of locations you want in your array, you also have to calculate in the size of the type your array contains. When you tell the compiler you want `environ[1]` it knows the size of `char\*\*` and increments the pointer `1 * sizeof(char\*\*)` So when we allocate memory we have to be mindful of the type of the array, and not just the size.
