---
date: 2014-03-03T01:00:00Z
title: Introduction to GIT CLIP
tags:
  - tools
  - environment
---
Due to the collaborative nature of **_git_**; over time I begin to accumulate quite a few branches and working closely in a team compounds this problem. Remembering what branch needs to be merged, and what branches need a pull can tax the little grey cells.

As a solution to this problem, I present `git clip` Instead of trying to explain what it is, lets just run `git clip` and examine it’s output.

Here is a run of `git clip` on a project at work

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
Since it’s master it doesn't have commits ahead or behind `(0/0)` and should always follow `[origin]`. The following indented lines show all the remotes master can pull from. You can see `remotes/cory/master` is 17 commits behind our master, this means **_cory_** should pull from us or from upstream. You can also see that upstream is 2 commits ahead, this means we should pull from upstream. `git clip` will also show if **_our_** master is ahead and needs to be pushed.

#### Tracking Remote Branches
On the next line we see the `sqlalchemy08` branch.
![[git-wtf-sqlalchemy.png]]
In this branch cory has a patch to introduce sqlalchemy 8.0 into our project. Since I was reviewing the patch I tracked cory's branch. You will notice this branch tracks `[cory]` instead of `[origin]`. Also notice `git clip` shows us this branch has 2 commits ahead of master, and 2 behind. I might need to rebase before I merge this branch into master.

#### Collaborating on single branch
Next we see the `volume-manager` branch.
![[git-wtf-volume-manager.png]]
Me and cory are collaborating on this branch. `[origin]` tells us the local branch is tracking origin but the following two indented lines shows cory has this branch also. It also tells us cory's branch is 1 commit behind. Which means he needs to pull from us.

#### Un-published branches
Moving on we see `branch-not-published`
![[git-wtf-not-published.png]]
`(2/0)` tells us the branch has 2 commits ahead, and no commits behind. Also there is no `[name-of-tracking-remote]` so we know this branch is not tracking a remote. Notice there are no indented lines following this line. This means there are no remote branches so we know this branch is local only.

#### Already merged
I originally created `git clip` to help me clean up already merged branches. Often I do this clean up weeks or months after a branch has been merged into master.
![[git-wtf-update-docs.png]]
Here you can see this branch has already been merged, as it has no new commits to provide and is behind master by 10 commits. which probably means it hasn't been updated in a while

#### TLDR
`git clip` brings order to chaos and riches to poor git programmers.

## Installation
Download a copy of the `git clip` by following the instructions [here](https://github.com/thrawn01/clip)

> [!note] 
> This project was originally a collection of a few scripts in my `~/dotfiles` called `git wtf` which was based off an other project which has been lost to time. I eventually gave up the `wtf` name and went with `clip`. But I never went back and updated the screen shots.

