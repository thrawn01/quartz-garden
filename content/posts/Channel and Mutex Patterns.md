---
date: 2016-08-15T13:11:04-05:00
draft: false
title: Channel and Mutex Patterns in Golang
tags:
  - golang
  - programming
---
In Golang channels are the recommended method for sharing data between threads,
and I don't refute this, but for simple single value data access a mutex is
often more appropriate, simpler and more performant.

While building the [args](http://github.com/thrawn01/args) library, I needed a
way to provide end users a thread safe way to retrieving the newest version of
a config object. As I was very excited about my first practical application
of channels, I initially implemented value access using golang channels.

Don't miss understand, there is absolutely nothing wrong with using channels.
but coming from a C++ background I found the resulting code to be overly
complex for such a simple task.

Here is an example implementation from my benchmark project
```go
type ChannelSafety struct {
	values *Values
	channel    chan *Values
	done   chan struct{}
}

// Create a new object and start the go routine that will feed values to Get()
func NewChannelSafety(values *Values) *ChannelSafety {
	parser := &ChannelSafety{&Values{}, make(chan *Values), make(chan struct{})}
	parser.Start()
	parser.Set(values)
	return parser
}

func (self *ChannelSafety) Start() {
	go func() {
		defer func() {
			close(self.channel)
		}()
		for {
			select {
			case self.channel <- self.values:
			case value := <-self.channel:
				self.values = value
			case <-self.done:
				return
			}
		}
	}()
}

func (self *ChannelSafety) Stop() {
	close(self.done)
}

func (self *ChannelSafety) Set(values *Values) {
	self.channel <- values
}

func (self *ChannelSafety) Get() *Values {
	return <-self.channel
}
```

Even if you ignore the house keeping chore of starting and stopping the
goroutine, this is more complexity than I really wanted, especially when you
compare it to an implementation that uses a mutex. 

```go
type MutexWithDefer struct {
	values  *Values
	mutex sync.Mutex
}

func NewMutexWithDefer (values *Values) *MutexWithDefer {
	parser := &MutexWithDefer{}
	parser.Set(values)
	return parser
}

func (self *MutexWithDefer) Set(values *Values) {
	self.mutex.Lock()
	self.values = values
	self.mutex.Unlock()
}

func (self *MutexWithDefer) Get() *Values {
	self.mutex.Lock()
	defer func() {
		self.mutex.Unlock()
	}()
	return self.values
}
```
What is even more interesting, the mutex version is faster than the channel
version. In a real world application the difference is negligible; the mutex
version runs in 31 seconds, the channel version runs in 39 seconds. (See
benchmark results below)

Since my initial implementation in [args](http://github.com/thrawn01/args),
I've found at least one other use for singleton like access where a mutex was a
decidedly simpler solution. I’m experimenting with a reusable pattern where
any struct that wants thread safe member access can encapsulate a ```Locker```
object. The result looks like this.

```go
type LockableThing struct {
	values  *Values
	Locker
}

func NewLockableThing (values *Values) *MutexWithDefer {
	parser := &MutexWithDefer{}
	parser.Set(values)
	return parser
}

func (self *LockableThing) Set(values *Values) {
	self.WithLock(func() {
		self.values = values
	})
}

func (self *LockableThing) Get() (result *Values) {
	self.WithLock(func() {
		result = self.values
	})
	return
}
```

This example is super simple and doesn't save typing but you can imagine
wrapping more complex logic inside the anonymous function.

The implementation looks like the following
```go
type Locker struct {
	mutex sync.Mutex
}

func (self *Locker) WithLock(callBack func()) {
	self.mutex.Lock()
	callBack()
	self.mutex.Unlock()
}
```

[Here](github.com/thrawn01/channel-mutex-defer-benchmarks) is the code for the
benchmarks. And here are the results from my laptop.

```
 make
go test -v ./...
=== RUN   TestApi
Running Suite: Mutex Benchmark Suite
====================================
Random Seed: 1471284191
Will run 6 of 6 specs

• [MEASUREMENT]
Thread Safe Benchmarks
  NotThreadSafe
    Fastest Time: 29.627s
    Slowest Time: 29.627s
    Average Time: 29.627s ± 0.000s
------------------------------
• [MEASUREMENT]
Thread Safe Benchmarks
  MutexWithDefer
    Fastest Time: 31.188s
    Slowest Time: 31.188s
    Average Time: 31.188s ± 0.000s
------------------------------
• [MEASUREMENT]
Thread Safe Benchmarks
  MutexWithoutDefer
    Fastest Time: 32.350s
    Slowest Time: 32.350s
    Average Time: 32.350s ± 0.000s
------------------------------
• [MEASUREMENT]
Thread Safe Benchmarks
  MutexWithLock
    Fastest Time: 32.201s
    Slowest Time: 32.201s
    Average Time: 32.201s ± 0.000s
------------------------------
• [MEASUREMENT]
Thread Safe Benchmarks
  RWMutexWithDefer
    Fastest Time: 31.671s
    Slowest Time: 31.671s
    Average Time: 31.671s ± 0.000s
------------------------------
• [MEASUREMENT]
Thread Safe Benchmarks
  ChannelSafety
    Fastest Time: 39.555s
    Slowest Time: 39.555s
    Average Time: 39.555s ± 0.000s
------------------------------

Ran 6 of 6 Specs in 196.593 seconds
SUCCESS! -- 6 Passed | 0 Failed | 0 Pending | 0 Skipped --- PASS: TestApi (196.59s)
PASS
ok     	github.com/thrawn01/channel-mutex-defer-benchmarks     	196.607s
```


