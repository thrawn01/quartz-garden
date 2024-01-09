---
date: 2014-03-03T01:00:00Z
title: Introduction to GIT WTF
tags:
  - tools
  - environment
---
Due to the collaborative nature of **_git_**; over time I begin to accumulate quite a few branches and working closely in a team compounds this problem. Remembering what branch needs to be merged, and what branches need a pull can tax the little grey cells.

As a solution to this problem, I present `git wtf` Instead of trying to explain what it is, lets just run `git wtf` and examine it’s output.

Here is a run of `git wtf` on a project at work

![[git-wtf-at-work.png]]
A lot of information there, lets start with the first two lines
![[git-wtf-storage-node-metadata.png]]
The first line has the branch name `storage-node-metadata` Followed in parens by how many new commits this branch introduces on top of `master` (commits ahead). Next is a slash `/` followed by the number of commits master has that are missing from this branch (commits behind). Following that in brackets is the name of the remote repo this branch is tracking, in this case we are tracking `[origin]`.

In short this one line provides the following: 

`branch-name (commits ahead/commits behind) [name-of-tracking-remote]`

The second line in our example is indented and shows a list of remotes where this branch exists. I published this branch to my github fork of the project so it only shows 1 entry for origin. Knowing what other remotes have this branch can be very helpful. If for instance you are collaborating on a single branch.

So in review, the `storage-node-metadata` branch has 1 commit not merged into master, and is 5 commits behind master

### Master
Now lets look at `master`
![[git-wtf-master-origin.png]]
Since it’s master it doesn't have commits ahead or behind `(0/0)` and should always follow `[origin]`. The following indented lines show all the remotes master can pull from. You can see `remotes/cory/master` is 17 commits behind our master, this means **_cory_** should pull from us or from upstream. You can also see that upstream is 2 commits ahead, this means we should pull from upstream. `git wtf` will also show if **_our_** master is ahead and needs to be pushed.

#### Tracking Remote Branches
On the next line we see the `sqlalchemy08` branch.
![[git-wtf-sqlalchemy.png]]
In this branch cory has a patch to introduce sqlalchemy 8.0 into our project. Since I was reviewing the patch I tracked cory's branch. You will notice this branch tracks `[cory]` instead of `[origin]`. Also notice `git wtf` shows us this branch has 2 commits ahead of master, and 2 behind. I might need to rebase before I merge this branch into master.

#### Collaborating on single branch
Next we see the `volume-manager` branch.
![[git-wtf-volume-manager.png]]
Me and cory are collaborating on this branch. `[origin]` tells us the local branch is tracking origin but the following two indented lines shows cory has this branch also. It also tells us cory's branch is 1 commit behind. Which means he needs to pull from us.

#### Un-published branches
Moving on we see `branch-not-published`
![[git-wtf-not-published.png]]
`(2/0)` tells us the branch has 2 commits ahead, and no commits behind. Also there is no `[name-of-tracking-remote]` so we know this branch is not tracking a remote. Notice there are no indented lines following this line. This means there are no remote branches so we know this branch is local only.

#### Already merged
I originaly created `git wtf` to help me clean up already merged branches. Often I do this clean up weeks or months after a branch has been merged into master.
![[git-wtf-update-docs.png]]
Here you can see this branch has already been merged, as it has no new commits to provide and is behind master by 10 commits. which probably means it hasn't been updated in a while

#### Final Note
`git wtf` does not preform a `git fetch` to determine the status of remote branches, you have to keep your local git repo updated by preforming `git fetch` yourself. I made a helper script called `git fetch-all` which does exactly what it says, it runs `git fetch` for all the remotes git knows about. You can get a copy [here](https://github.com/thrawn01/dev-tools/blob/master/git-fetch-all)

#### TLDR
`git wtf` brings order to chaos and riches to poor git programmers.

## Installation
Download a copy of the `git wtf` script from [here](https://github.com/thrawn01/dev-tools/blob/master/git-wtf)

#### OSX
1. Chdir to git’s exec-path directory `` cd `git --exec-path` ``
2. Copy the script there and call it `git-wtf`

#### Ubuntu/Linux Distro’s
On Ubuntu you have 2 options.

1. Repeat the install instructions for OSX
2. Place the `git-wtf` script somewhere in your local `$PATH`, where `git` will find it. I usually create a `~/bin` directory and add `~/bin` to my `$PATH` then place `git-wtf` and all my other git helper scripts there.