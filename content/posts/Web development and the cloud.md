---
tags:
  - cloud
  - thoughts
date: 2010-07-12T00:00:00Z
---

More people are realizing that beyond the hype, the cloud can be a real game
changer. But how that effects each tier of the software stack I think is up for
some debate. Deciphering the future path development is something of
a mystic art, of which I will attempt to partake.

I think it was apparent to any one who attended Google IO 2010 that google was
really pushing the idea of the browser as a platform. This is a different take
on the browser than most of the developers I have daily interaction with. Most
of the developers I know don't want the browser to be the platform of the
future mainly because of the browser compatibility issues. First its the Works
in Firefox but not in Internet Explorer  then there are the performance issues,
network and JavaScript based and I've heard more of my fair share of DOM hate .
Having worked with the browser most developers are left with a very sour taste
in their mouth and groan loudly when ever some one states the browser is the
platform of the future!

So why is Google betting on the browser? Even at a time when most couldn't
imagine the browser providing a truly interactive experience Google Maps made
its debut and changed everything. But Google has a problem, The browser as a
platform can be a very hostile development environment. So it's no surprise
Google IO 2010 sessions were flooded with ways to make rich client side
applications on the browser simple and less hostile. Google's prize fighter in
this effort is GWT. The GWT compiler abstracts away the browser specific issues
improves the performance of the client side application and encourages code
reuse between client and server. GWT attempts to allow developers focus on the
application experience without all the browser specific worries that are
usually associated with complex rich browser applications.

This shift from avoiding client side development to adopting it as the primary
development strategy has some interesting consequences. First is the movement
of the presentation layer from the server side to the client side. Because of
this, the HTML template engine is no longer be useful to modern browser
developers. Also, Ajax moves from being a cute way of creating the appearance
of an interactive application to the primary way an application retrieves data
from the web head. In this new paradigm the web head becomes what is
essentially an RPC service. To any one that is paying attention this shift has
huge implications for web frameworks like ruby on rails, that have built their
framework around server side templates and easy creation of restful web
services. What this means is that the bulk of the application is no longer on
the server side, but on the client side. This is a big win for scalability as
the web head has less to keep track of and is freed to be more stateless, which
is just what you want if you want to scale your web application to millions of
users. One last thing this paradigm shift means; SOA gains much more relevance
in the web application space. A rich client consuming (REST based) web services
is a match made in heaven for SOA.

In the cloud space PaaS is probably the most under estimated and un-interesting
to most early adopters of cloud. Most major customers of cloud services are
more interested in figuring out how their current software platforms can
utilize the cloud than develop applications targeting the cloud platform. The
fear for cloud adopters is of vendor lock-in.  If you develop applications for
Google App engine then you decide you want to use some other cloud vendor, your
stuck. You have developed your application for Google's PaaS; and it's not
exactly transferable to other cloud vendors or for that matter on premise. This
issue alone is the biggest detractor to PaaS.  Cloud vendors are just not
seeing a lot of traction in the PaaS space, and I think this is the primary
reason.

What we need is a PaaS independent platform developers can target which will
work no matter what cloud vendor you choose. The Good news is Google recognizes
the PaaS issue and is hoping to capitalize on the success of the Java standards
in the cloud. In the Google IO 2010 Key note they announced a partnership with
VMware to deliver an open development platform that all cloud vendors could
implement and allow developers to target a vendor neutral PaaS.  

This could be huge, as this vendor neutral development platform could bring
more companies to the cloud and truly change the way we look at hardware from a
development standpoint. No longer are we worried about how our application will
scale within the hardware infrastructure. Developers will be free to focus on
the client side user experiences and web services on the server side should
just scale as needed thanks to the cloud. One button deployment to a production
system can truly be a reality lifting a huge burden off change and release and
developers in general.

How PaaS could do this may be the subject of a future post. But for now, I
think its safe to say PaaS has a big future ahead of it.



