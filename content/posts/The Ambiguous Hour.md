---
tags:
  - python
  - programming
date: 2011-11-10T00:00:00Z
---

Since the US observes Daylight Savings; every year we take 1 hour from the spring and give it to the fall.
As the old adage goes we **spring** forward in the summer, and **fall** back in the winter. When we fall back,
which is at 2:00 AM on the first Sunday in November we introduce the ambiguous hour. This year the ambiguous
hour lands on November 6th. The hour is ambiguous because at 1 minute after 2:59 it's 2:00 AM again.
Even tho it was 2:00 AM 1 hour ago.... 

To understand why this is might cause problems, Imagine a local theater is putting on a special showing of
 blockbuster moving starting at 2:00 am on November 6th. If I were to show up at 1:59 and my friend;
 who was supposed to meet me there -- showed up at 2:59, one of us would miss the special showing,
 Even though technically we are both on time.

Most systems that care about this kinda of stuff handle the ambiguous hour by designating one them with
 the a different offset. So if we are in Texas on Nov 6th, the 2:00 AM hour would be 2:00 AM CDT
 (Central Daylight savings Time ; -7 UTC), and the second hour would be 2:00 AM CST
 (Central Standard Time ; -6 UTC).  Unfortunately most systems grab the localtime from the system when
  preforming datetime calculations; most of the year this works just fine; until the first Sunday in November.

Consider the following python code
``` python
import datetime 
import pytz
tzinfo = pytz.timezone("America/Chicago")
date_time = datetime.datetime(2011,11,06,2,0,0, tzinfo=tzinfo)
print date_time.strftime('%Y-%m-%d %H:%M:%S %Z%z')
print date_time + datetime.timedelta(hours=-1)
```

Output:
```
2011-11-06 02:00:00 CST-0600
2011-11-06 01:00:00-06:00
```

[pytz](http://pytz.sourceforge.net/) assumes Standard Time, but when we ask the timedelta for the previous hour, we get an incorrect result,
 It should have reported the time as 2011-11-06 01:00:00 CDT -07:00, but instead throws away the time zone
 information during the calculation. If we do this calculation in UTC then convert to localtime we get the correct result.
 The only problem for programmers is figuring out when the DST transition occurs. Even using the excellent pztz library relies
 on the programmer to tell it when the calculation result should be in DST.

My solution to this problem in python was to parse the olsen database and figure out the DST transition times
 then pass the dst flag to pytz when converting to localtime

Note: This is a well understood limitation in python, Search <http://docs.python.org/library/datetime.html>
 for the keyword 'ambiguities'.

