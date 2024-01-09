---
date: 2008-01-10T00:00:00Z
---
### How long does it take to install an OS?
Apparently, 2 days...

Lets start at the top, Mix in a small army of new DL360 G5 servers from HP ( 7
Cores, 6 Hard drive Raid 5 arrays ) and Redhat Enterprise 5 and you get
problems. Just before RPM installation begins, anaconda throws an exception and
reports the following error.
<!--more-->

```
SystemError: lvcreate failed for /dev/blah/blah( 100 lines of Goo follow )
```

### Day 1 
Someone thinks it's a driver issue. Google reveled someone else had problems
installing their OS on the same hardware we had, with similar errors. Spend
hours trying to verify the updated driver for the array controller was A -
installed, B - used properly. Next we notice lvcreate and pvcreate are not
included on the ramfs when we access the shell from the redhat installer. So we
search for updated anaconda installers (Still don't know how anaconda creates
LVM partitions without lvcreate or pvcreate. `find . | grep pvcreate` returns
nada) I try some other stuff then go home.

### Day 2
Brandon pulls the Firmware for the MOBO from the HP website and gets the OS to
install. But when we try to duplicate that trick it doesn't work. We note the
OS installed on the 200GB array, but not the servers with 600GB arrays.
Retraced the steps taken on the 200GB array and duplicated them on the 600GB
array servers.... nada. Next I notice a funny looking error at the bottom of
the exception anaconda gave us. ( Not sure if it was there pre firmware update
)
Read only file system `/dev/hda1 insufficient free extents for VolumeVOL000, blah,blah`
Google doesn't help much, but then it strikes us we might have encountered some
max size of a LVM Volume. ***Google some more***

### Synopsis 
Turns out an "extent" is the size of a chunk of space allocated on a LVM
Logical Volume. According to one site the max number of extents you can have on
a single logical drive was 65,000 and if your extent size was to small it might
put you over this limit. Anaconda figured we needed a 32MB extent size, What we
actually need was 64MB extent. Why this is the case, I'm not entirely sure. (When
I get some more time I will append the answer to this post). But getting the OS
installed involves a 2 step process.

1. Update the firmware on the MOBO
2. Up the extent size of the logical drive using disk druid

