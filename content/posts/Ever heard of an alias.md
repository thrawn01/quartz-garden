---
date: 2005-02-16T00:00:00Z
tags:
  - apache
  - http
---

Whilst I was perusing the `httpd.conf` file on atomsk and discovering
`sheheane.net` and a plethora of strange and weird websites all hosted on this
box, I noticed alot of this.
```
ServerName sheheane.net
DocumentRoot
/home/vudu/public_html
ServerAdmin mike@radioinactive.com
ServerName www.sheheane.net
DocumentRoot /home/vudu/public_htmlServerAdmin
mike@radioinactive.com
```
where it should be like this.
```
ServerName thrawn01.org
ServerAlias www.thrawn01.org
DocumentRoot /home/thrawn/public_html
ServerAdmin thrawn01@gmail.com
```
And just like that, BAM!
my blog becomes a repository of useful knowledge.

