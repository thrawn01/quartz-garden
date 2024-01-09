---
date: 2007-08-30T00:00:00Z
tags:
  - programming
  - java
---

Why are closures so cool? Well imagine this example based on a presentation on
closures in the Java language
[An update on Java Closures](http://www.parleys.com/display/PARLEYS/An%20update%20on%20Java%20Closures)
``` java
List parseItems(String line ) {
 List list;  return Item.map( line, { Item s => list.put( s.uid ) });
}
```
Do you see what is happening here? First the purpose of this code is to take a
string and parse it into a list of items. Next notice we are passing �line�
into a function called map() along with what appears to be an anonymous
function. But wait, inside the anonymous function there is a reference to
list!. This lexical scoping allows us to access variables defined in the
scope of the calling method (parseItems()) and use them inside this anonymous
function, Which is actually called a *Lexical Closure* Now you might be saying,
why we can't just do this as a loop? Well, we can't like so.
``` java
List parseItems(String line) {  
  List items;  
  List list;
  // Get a list of the items from the map  items = ListItem.map( line );
  // Now iterate over the list and get the user id  
  Iterator myVeryOwnIterator = items.entrySet().iterator();  
  while(myVeryOwnIterator.hasNext()) {     
     List e = myVeryOwnIterator.next();
     List.put( e.uid );
  } }
```
Despite the obvious, *This takes more code* there is a lot of boiler plate code
to the second example. I mean, you have to call the map() function to get a
list, then iterate over the list to get at what you actually want. Which is
*item.number* But what if you want *item.name* or *item.something*? What
typical programmers then do is copy the boiler plate code in parseItems() and
create a new function called parseItemsName() which returns a list of names
instead of user id's using almost the exact code but changing only a few lines
to get the desired result. Code duplication! (Unnecessarily I might add) But
by using closures we eliminate the need to use boiler plate code and just use
to the map() function in it's simplest form. If we want e.name instead of e.uid
we do this. `Item.map( line, { Item s => list.put( s.name ) });` But wait! Our
requirements change. Again! Now we have to get only the user id and names of
items that are of a certain age or older. So now with lexical closures we can
do this.
``` java
Item.map( line, {
    If( s.age &gt; 20 ) {
        list.put( s.name );
    }
});
```
In our boiler plate example we would have to change each function that utilized
the boiler plate and modify, possibly copying even more boiler plate code into
another method that limits by age. Bottom line. More copy and paste. But you
say, that lexical closure code is ugly! (And I would agree). Anything beyond
1 line lexical closures do tend to look ugly, but what if we add a little
syntactic sugar. The following is just such sugar from the Java lexical closure
proposal
``` cpp
Item.map(line : s ) {
   If ( s.age &gt; 20 ) {
    list.put.( s.name );
}}
```
