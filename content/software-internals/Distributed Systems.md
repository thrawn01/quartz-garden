---
tags:
  - software-internals
---

## Locking
- [How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

## Papers
- [Rules-Based Programming for Distributed, Concurrent, Fault-Tolerant Code](https://www.usenix.org/conference/atc15/technical-session/presentation/stutsman)

## Reconciliation
- https://branislavjenco.github.io/desired-state-systems/ - Desired state systems reconciles the actual state with the desired state by observing, comparing, and applying necessary changes to achieve the desired state.
- [Control Theory](https://en.wikipedia.org/wiki/Control_theory) is a field of control engineering and applied mathematics that deals with the control of dynamical systems in engineered processes and machines. The objective is to develop a model or algorithm governing the application of system inputs to drive the system to a desired state, while minimizing any _delay_, _overshoot_, or _steady-state error_ and ensuring a level of control stability.

### Retry and Circuit breaker 
A circuit breaker acts like an automatic switch that prevents applications from repeatedly trying to execute an operation that’s likely to fail. In a distributed system, you don’t want to bombard a remote service when it’s already failing, and circuit breakers prevent that.
- https://rednafi.com/go/circuit_breaker/  Writing a circuit breaker in Go
- https://encore.dev/blog/retries An interactive study of common retry methods
- https://medium.com/yandex/good-retry-bad-retry-an-incident-story-648072d3cee6 Good Retry, Bad Retry: An Incident Story

