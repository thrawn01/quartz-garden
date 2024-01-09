---
date: 2007-10-31T00:00:00Z
tags:
  - systems
  - environment
  - tools
---
Well, I'm abandoning Gentoo for good now. It's been off and on for about a week. And If you spend more than a 8 hours during the week to install a working kde desktop. Your OS sucks ( Or you suck, depends on how you look at it ). A few Highlights.

First getting the kernel compiled. This is a cool idea, Customize your kernel to suit your hardware, yank out all the cruft and you have a lean mean kernel machine. I have done many many kernel compiles but unfortunately on my laptop I don't have an intimate relationship with the hardware, So telling the kernel what hardware I have isn't as straight forward as 'lspci' and choosing the correct modules.

Second, You never know what minor problems you will encounter. I've never really used grub, So I screwed up the grub config several times. After several attempts I finally got the frame buffer working properly. After all that I booted the box with no X, no Desktop, no nothing. And 'df -h' showed a whoping 2 gigs used! 600 megs of which was just for the portage install. On top of that the boot time on this lean machine was 55 seconds! Longer than my kubuntu default install! ( I finally figured out gen-kernel included initramfs and some other stuff I didn't need so I ripped that out and got it to boot in about 15 seconds! )

Third, I finally got the machine to boot with networking, framebuffer, most of my hardware detected. ( Sound and wifi not tested ) So I pull out my shiny new emerge toy and started the kde install. Which unsurprisingly lasted for about 3 hours then suddenly died. Seams portage didn't compile kdelibs before compiling kdenetworking. Fixed that... Got another error. Oh seams portage didn't compile qt-3 with OpenGL support. *Sigh* so much for a un-attended kde install.

At this point I've not used my laptop for anything but installing gentoo for a week. I know I'm at the halfway mark and it just seams wrong to turn back now. But I really don't want to bother with any other unforeseen issues. ( And I know there will be some ) So Bye Bye Gentoo! Hello Kubuntu and kde4 beta 4.
