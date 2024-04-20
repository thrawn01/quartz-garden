---
title: A Golang HTTP server refused to shutdown
slug: h2c-golang-shutdown
date: 2024-04-19
draft: false
tags:
  - golang
  - programming
  - http
---
Have you ever had one of those days where up is down, right is wrong, and you feel a nearly unrestrained urge to flip your desk, many many times....

That day; for me, was yesterday.

I was working on [Gubernator](https://github.com/gubernator-io/gubernator) refactoring the code for a future v3 release, when a test which never failed before, began to fail. 

When I run the test in isolation, the test passes.... YAY... it's one of THOSE problems. 

So I look at the test that runs just before the failing test. This test starts a gubernator cluster, preforms some HTTP requests to some of the peers in the cluster, then restarts all the peers in the cluster. This test runs perfectly.

The test that runs next is the test that fails. It assumes there is a cluster already running, which it is; and makes some requests to a random peer in the cluster. However, requests to any peer in the cluster return an error from the peer saying essentially "I'm shutdown, go away".  This begs the question...

HOW is it possible that I'm connecting to a peer via HTTP that is shutdown?

I verify that as apart of the peer shutdown, I close the `http.Server{}` and for good measure I set the `net.Listener` and the `*Service` implementation to nil, which should mark them for garbage collection. At this point during shutdown, it is seems impossible for the shutdown peer to receive any new HTTP requests, as (I verified) the HTTP SERVER IS NO LONGER BOUND TO A LISTENING PORT!

However, HTTP requests to the peer are CLEARLY talking to the `*Service` instance I just shutdown and it is CLEARLY talking to it via HTTP. 

WUT!?!?!?!?!!?

Fast forward 3 hours of checking every possible thing I could think of, including flipping imaginary tables.

Turns out the HTTP client is using a default client I defined as `DefaultClient = &http.Client{....}`; Notice the `&`;  this means this `http.Client` is shared amongst all of the peer clients, including beyond test boundaries and peer shutdown and restart. This should be fine, all the connections should be terminated when I shutdown the `http.Server{}` right?? RIGHT!?!?!?!?

I also note that when I restart all the peers in the cluster, the new peers start with the same IP addresses as the shutdown peers. (This is fine)

What isn't fine, is that the shared client still has `active` connections to the old peers even after I shutdown the peers `http.Server{}`. So... when I create new clients in the failing test pointing to the new peers and make requests to the new peers, the shared client says. "OH, you want a connection to this IP... It so happens I already have an open connection to that IP"; and uses that. (which is still connected to the shutdown peer).

Wait... how is it STILL CONNECTED TO THE SHUTDOWN PEER?!?!?!?!!?

So I check my sanity and look at the docs for `http.Server.Shutdown()`

```go
// Shutdown gracefully shuts down the server without interrupting any
// active connections. Shutdown works by first closing all open
// listeners, then closing all idle connections, and then waiting  
// indefinitely for connections to return to idle and then shut down.
// -- SNIP --
func (srv *Server) Shutdown(ctx context.Context) error {
```

I dunno about you, but this kinda jumped out at me. "then waiting INDEFINITELY for connections to return to idle and then shut down". In my now frustrated brain, I read that to mean. 

```
// You can't establish new connections, but.... you CAN still make HTTP
// requests using existing connections if your fast enough.
```

This doesn't seem right.... proxies re-use connections for connection efficiency all the time... clean shutdown would be impossible if this was the case... right???? RIGHT!?!?!?!?!? I guess if the proxy takes your server out of rotation, then you shutdown the server it should be okay... but if you don't have a proxy, and a rogue client refused to disconnect, it could theoretically keep your server from shutting down, or possibly call handlers with references to resources that have been shutdown.

A wise man once said `I do not think that word means what you think it means" -- Inigo Montoya (You killed me father, prepare to die)`

So I decided to verify what actually happens to connected clients when you shutdown an HTTP server, and wrote a few tests for H2C (which I was using at the time), HTTP/1 and HTTP/2 servers. You can find that code here -> https://github.com/thrawn01/go-http-shutdown

What I discovered was; a running HTTP/1 and HTTP/2 server WILL disconnect active clients after all the active handlers have returned. HOWEVER, the H2C server will never completely shutdown if there are active client connections. 

In case your not familiar, H2C stands for HTTP/2 over Clear text. HTTP/2 is impossible without TLS by default, but the RFC does allow an exception which allows HTTP/2 to operate without TLS called H2C. I wrote a blog post a while back on how to accomplish this using golang. See [[H2C Golang]]

I'm now a full day in and I now know why my tests are failing. The H2C server never closed the active HTTP client connections during shutdown. These connections then bleed over into the second test where I used the client to make requests to a peer with the exact same IP as the shutdown peer, which caused the HTTP client to re-use the connection to the then shutdown peer. Ahem..... I love my job.

Now... because I can't help myself, I woke up the next day and started digging into the H2C code in `golang.org/x/net/http2`. What I discovered was; to achieve H2C without TLS the `h2c.Handler` hijacks the HTTP/1 connection, converting it to a normal `*net.Conn` and then calling `http2.ServeConn()` using the hijacked `*net.Conn`. 

So, a little background.... when a connection is hijacked the `http.Server` no longer has ownership of the connection. Ownership passes to the handler which preformed the hijacking. For HTTP/2 over clear text this means it's up to the handler which called `http2.ServeConn()` to close the connection. Sure enough, there is a `defer conn.Close()` in the handler which appears to do this. 

However, since HTTP/2 uses `streams` to multiplex requests `http2.ServeConn()` doesn't always return once the request is complete. It can.. and DOES hold on to the connection which is used to multiplex streams for additional requests. This is all working as intended. But the question remains. 

How do I tell `http2.ServeConn()` to shutdown all zee streams when `Server.Shutdown()`  is CALLED!?!?!?

After quite a bit of sleuthing, I found that; internal to http2, there is a `state` which holds a `serverConn` which can send messages through a channel to the underlying server. Interestingly this is using the same request/response over channels technique I've used successfully in multiple projects. (Great minds think alike 😁)

```go
func (sc *serverConn) sendServeMsg(msg interface{}) {  
    sc.serveG.checkNotOn() // NOT  
    select {  
    case sc.serveMsgCh <- msg:  
    case <-sc.doneServing:  
    }  
}
```

One of these messages is `gracefulShutdownMsg = new(serverMessage)`

FANTASTIC! Who sends this message?!?!?!

I trace it back to this call `s.RegisterOnShutdown(conf.state.startGracefulShutdown)` BINGO, oh look it's called in a public method called `ConfigureServer()` which helpfully says in the docs `ConfigureServer adds HTTP/2 support to a net/http Server`... which, it just so happens, is the exact thing we are hijacking for our H2C support!

The solution is simple, after creating the HTTP/1 server `http.Server{}` we call `http.ConfigureServer()` on the server before we call `ListenXXX()`.

```go
h2s := &http2.Server{}  
mux := http.NewServeMux()  
mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {  
    _, _ = fmt.Fprint(w, msg)  
})  
  
s.srv = &http.Server{  
    Handler: h2c.NewHandler(mux, h2s),  
    Addr:    address,  
}  
  
// SECRIT SAUCE HERE!!!!  
// Must add ConfigureServer in order for graceful shutdown to work as expected.  
if err := http2.ConfigureServer(s.srv, h2s); err != nil {  
    panic(err)  
}  
  
s.wg.Add(1)  
go func() {  
    if err := s.srv.Serve(s.listener); err != nil {  
       if !errors.Is(err, http.ErrServerClosed) {  
          panic(err)  
       }  
    }  
    s.wg.Done()  
}()
```

Now all is well! The test thing does the thing, and connections are shutdown properly.

Now that two days have passed, and I'm writing this blog post at the end of day two because, I just HAD TO TELL SOMEONE OF MY PLIGHT. Thank you, poor reader for getting this far. I just needed too, I needed to get this out.

Now that I understand why all this happens, and how to fix it, I'm going to remove all H2C code from gubernator tomorrow. Yes, I'm that guy, the guy who even though I'm not going to use this thing, needs to know why it happened, why things are the way they are. Thats how I grow, that's how I operate. Heh, Heh, HEheeeeeeeeee.... 🫠

So... you might ask, why are you not going to use H2C in gubernator?

Well... because that is because I planned on removing it anyway... I'm doing that because I discovered a few weeks ago that HTTP/2 is slower than HTTP/1 on golang. YES, IT'S TRUE!

Since HTTP/2 is slower than HTTP/1 it  is not suitable for a high performance service like gubernator. (at this moment)

Not convinced about the HTTP/2 performance gap?  See my benchmark [here](https://github.com/duh-rpc/duh-go-benchmarks) then see reported golang issue [here](https://github.com/golang/go/issues/47840) and stuff [here](https://github.com/nspeed-app/http2issue), [here](https://github.com/kgersen/h3ctx) and [here](https://www.emcfarlane.com/blog/2023-05-15-grpc-servehttp)

Hopefully, future you will find all these performance issues a thing of the past, but as for present me, I persist.