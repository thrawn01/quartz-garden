---
date: 2007-11-12T00:00:00Z
tags:
  - systems
  - environment
  - tools
---
In this post I hope to reveal some tips I have learned over the years on how
you can improve your efficiency with the KDE desktop. But first I must address
a few objections people may have to using KDE for efficiency. The first
objection when recommending KDE as the desktop of choice is how slow it is.
I'll whole heartedly agree when I first began using KDE way back in KDE 2.0 it
was visibly slower than anything gnome had. But ever since 3.0 KDE has had an
enormous boost in performance. When comparing KDE responsiveness over gnome
today, there is a small but noticeable difference in KDE's performance over
gnome. I've had more than 1 die hard gnome fan mention gnome has lost its
pension for speed recently. If you haven't looked at KDE in a while now is a
great time to check it out.

The second objection I hear is that KDE is just plain ugly and I'll have to agree. I think as desktops go KDE 3.x has most unappealing default look of any desktop. Especially when compared to gnome. But with a few tweaks and about 15-20 minutes of your time, KDE's power and customization really out shine any other Linux desktop available. Some of the tweaks I'll share I have learned from many years in software development and system administration. Both camps can benefit from theses customizations and tips.

![[KDE-Desktop.png]]

## Key Bindings improve productivity
Effective use of key binds is what separates the grok administrators from the
Gurus. So any article on improving productivity must include information on
effective key bind use. In fact, the best sys-admin I've ever had the
opportunity to work with was at his peek performance while in 'eterm' with a
plethora of screen sessions open. In KDE, Konsole is a wonderful substitute
for screen adn assists those of us with less than perfect short term memory
to keep track of what session is for what task.Konsole Tabs Managing Konsole
tabs should be second nature. Moving tabs, creating new tabs and renaming tabs
should all have key binds. A sample key binding setup I use centers around my
love affair with vim. (I recommend vim users check out emacs, it takes some
work, but you can get emacs to act like vim, but you gain all the customization
power of emacs) Note: man, less and many other GNU tools all support vim style
movement keys so this setup will encourage constancy)

```
Ctrl+Shift+L   = Change active session to the next tab
Ctrl+Shift+H   = Change active session to the previous tab
Ctrl+Alt+Left  = Arrow Move the tab location to the left
Ctrl+Alt+Right =  Arrow Move the tab location to the right
Ctrl+Shift+N   = New Tab
Ctrl+Alt+S     = Rename Tab
Ctrl+Shift+F   = Full Screen[/text]
```
Practice opening, navigating, and renaming sessions with these key binds until
it becomes second nature. Before long manging multiple sessions and
multitasking sessions will drastically improve your productivity in the
console.

## Window management ##
Key binds for window management is extremely useful as this lessens the need to
reach for the mouse further. ( Horizontal and vertical control can be changed
depending on how your brain thinks of Vert/Horz in relation to up/down )

```
Maximize Window Horizontally =  Ctrl+Shift+K ( or J )
Maximize Window Vertically   =  Ctrl+Shift+J ( or K )
Maximize Window              = Ctrl+Shift+K
```
Practice opening a new emacs/vim window then maximizing the view vertically /
Horizontally to improve visibility of the file. Opening new editor windows and
Konsole sessions, switching between tasks will never involve the use of the
mouse again. TIP: Kwin can remember the location and window size of any given
application. A reasonable default location on the screen can help improve
productivity if you know exactly where a new window will show up on the screen.
To do this, position the application window in the desired location and size,
right click the Title Bar select Advanced -- Special Application settings
Enable the Size and Position then choose the appropriate action for both. I
usually select Apply Initially as I may want to move and resize the window
depending on the task. Click OK, and try opening that application again. As any
data entry professional will tell you constancy breeds higher productivity.

## Key binds and window movement ##
On occasion window movement or resize is needed. However many seconds spent
placing and clicking the cursor on the 2-3 pixel wide bar that allows window
resize and movement can imped the work at hand. ( Not to mention the
profanities that fly when your in a time critical situation and you miss the
dam bar 3 times in a row and click raise the window behind it obscuring your
work from view ). The following binds can help lower your blood pressure and
improve your window management proficiency. Once these keys and movements are
embedded into your finger memory you will feel as if you've lost a leg if you
ever have to return to a Microsoft Windows environment. ( You've been warned! )

```
Alt + Left Mouse Click = Move the window
Alt + Right Click      = Resize Window
```
The wonderful thing about KWin ( and other window managers that implement this
feature fluxbox, blackbox ) is the location of the Alt+ Right Click within the
window determines the type of resize desired. Atl + Right click and hold the
bottom corner region of the window and you can resize horizontally and
vertically as if you had click the corner bar. Alt + right click the center
left or right regions of the window and you can adjust horizontally . Alt +
right click on the upper or lower regions of the window and resize vertically.
Once you realize the speed at which you can maneuver and position windows with
this feature you will never look back.

## Music management ##
Ok... So this may not improve productivity, but who among us professionals
doesn't have a collection of mp3z to stimulate the brain during long hacking
cycles. My player of choice is Amarok. And if you haven't tried it, for anyone
with a moderate to extremely large mp3 collection Amarok is the killer apply of
players. I'll not go into the specifics of it's use but a few key binds make it
all the more enjoyable to use. The Meta key used here is the Windows Key on
my keyboard, Some prefer the atl or ctrl instead. All these shortcuts are
modifiable within the Amarok settings drop down menu.

```
Meta + C = Play/Pause
Meta + B = Next Track
Meta + Z = Previous Track
```
With Amarok running the volume control is a simple as placing the mouse over
the icon on the kicker tray and scrolling the mouse wheel up or down. You could
bind the volume control to some keys, but I've yet to do so.

## SSH Keys ##
Some administrators swear by ssh keys and some administrators just swear at the
sight of them. Your personal experience may shape your view. But nothing beats
the speed of logging onto remote systems without supplying a password during
crunch time. SCP / SSH are made one step simpler when using ssh keys. Obviously
this creates a security risk for your workstation if you don't include a
password on your keys. And some companies just don't allow their use.

## SSHFS ##
Forget samba shares. [SSHFS][3]  is the best thing to ever happen to mountable
network file systems and by its very nature SSHFS is far more flexible and much
simpler to setup than any samba share. With SSHFS you can mount file systems
from any computer on which you have ssh login access. This means all the file
servers on your local network and across the internet are all within the grasp
of SSHFS. Mounting remote Webservers and Diskspace from work or at home makes
this tool a must have for serious administrators. It is sometimes very
advantageous to use mc, Krusader, or dolphin to copy and mange files on a
remote server. Security buffs will be quick to point out that having all your
boxes mounted at your workstation creates a single point of intrusion on your
PC. Any cracker that gains access to your workstation now has access to every
mounted box on your workstation. So use with caution and ensure your
workstation is the most secure place on the network.

## Krusader ##
Now that we have all these wonderful SSHFS mounts we need a file manager that
shares our love affair with key binds and customization. [Krusader][4]  is just
such a beast. Anyone familiar with 'Gentoo' ( The file manager, not the distro
of the same name) or Midnight commander (mc) will feel right at home with
Krusader. I'll not list all the possible key bindings here, but trust me, you
can go crazy. Like Gentoo before it, Krusader is very customizable and
flexible. The split pane nature of Krusader may confuse new users at first, but
once you realize most file copy and move operations involve 2 open file manager
windows anyway, Krusader's layout will seam so natural.

Navigation of directories is done with the keyboard. Use the Up/Down arrow keys
to move the cursor, Left/Right arrows will navigate up or down the directory
hierarchy. Tab switches between panes, and insert will select files. If the
current directory listing involves several hundred entry's type the first few
letters of the file you are looking for and Krusader jumps the cursor to the
first file that matches.

Krusader also has access to the KDE's wonderful KIO style Urls. For example
using Krusader you can browse to remote file systems via ssh, ftp, or http. To
login to a remote box using ssh (I f you don't already have it mounted with
SSHFS) Type fish://username@hostname/path in the address bar. Enter your
user name and password and you have access to a remote file system from within
Krusader. You may want to bookmark this location for easy access later. (Click
the start to the right of the address bar and click Bookmark Current)

![[Krusader.png]]
## Leet Promptness ##
So this isn't exactly KDE specific eather, but it can help while in console
land. Copy and paste the following into your .bashrc file

```
C0="\[\e[0m\]"
C1="\[\e[1;30m\]" # <- subdued color
C2="\[\e[1;37m\]" # <- regular color
C3="\[\e[1;32m\]" # <- hostname color
C4="\[\e[1;34m\]" # <- seperator color (..[ ]..)
PROMPT='>'
export PS1="$C3$C4..( $C2\u$C1@$C3\h$C1 ($C2\$(current_branch)$C1): $C2\w$C1$C1 : $C2\t$C1 $C4)..\n$C3$C2$PROMPT$C1$PROMPT$C0 "
```

Now open a new bash session in Konsole. Despite the overly flashy look of this
prompt it can be very handy. Notice the current directory is listed separately
from the prompt and is positioned for easy identification. One feature many may
not be aware of is the mouse double click highlight. Move your mouse over the
directory in the prompt and double click. The the entire directory path is now
highlighted. Now middle click the mouse ( our press both left and right mouse
buttons simultaneously ) and the directory will be pasted into the prompt. This
can be extremely helpful when moving back and forth between many directories.
The paths to your previously access directories are listed in the console and
are just a double click away from your mouse copy and paste function. ( FYI,
The double click highlight feature is an Xorg feature not specifically KDE ).
If you don't like the colors just modify $C1 thru $C4 to your liking.

## Gvim tips ##
There are plethora of vim tips available out on the internet so I'll only list
a few that have become invaluable to me over the years.

### Centralize Vim Swap files ###
Tired of seeing tons of vim swap files littered across your file systems? This
addition to your .vimrc will centralize all your swap files into one directory.
Just remember to make the directory after adding this or vim will complain
`set dir=~/.vimswap`

### Mouse Context menu ###
The following addition to your .vimrc will give your mouse right click a
context menu for copy and paste, I've have found this invaluable when coping
and pasting to and from applications ( Java apps ) that don't support Xorgs
middle click paste ability.
```
set guioptions-=T
set mousemodel=popup
```
### Konsole style tabs in gvim ###
The following bit of code will setup the same key binds as I laid out for
konsole in gvim. [vimrc](https://github.com/thrawn01/dev-tools/blob/master/vimrc)

I hope someone finds these tips of use.

  [3]: http://fuse.sourceforge.net/sshfs.html
  [4]: http://krusader.sourceforge.net/
