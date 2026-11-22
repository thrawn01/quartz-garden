---
date: 2026-11-05
draft: true
tags:
  - programming
  - testing
  - artificial-intelligence
  - architecture
---
Coding agents rearrange implementation without asking permission. Proofs that assert those insides break on contact. Proofs that assert only what callers observe keep working while the insides move.

I call that discipline **immutable testing**. When the code changes, the old tests do not.

An old test that must be edited to go green either caught a broken contract or was never testing behavior. New behavior gets new proofs. Old proofs stay put.

We practiced this at Mailgun. We cared about behavior rather than implementation, which is why the practice is older than the name. Immutable testing is behavioral, contract, and interface testing with that one operational rule.

The AI era did not invent the rule. It made the cost of ignoring it obvious, because the author of the next diff might be an agent. Older systems already locked the same kind of surface.

## Go locks the surface

Go's `fmt` package locks what callers observe at the exported API. Its tests live in `package fmt_test`. The suite covers `Sprintf`, `Scan`, and the rest of the public API in table-driven proofs.

`testing/fstest.TestFS` checks any `fs.FS` against the interface contract rather than one implementation's private helpers.

SQLite's TH3 suite uses only the published SQLite interfaces. Postgres regression runs SQL scripts and diffs them against frozen expected files. Redis's Tcl suite drives commands and protocol behavior against a live server. Each of those systems treats the published surface as the thing worth locking, not the code behind it.

## Unedited old tests are the signal

In [Gubernator](https://github.com/gubernator-io/gubernator) and [Querator](https://github.com/kapetan-io/querator) I ship production changes that leave existing behavior tests alone.

| Change | Existing test files |
| --- | --- |
| Querator `GetNext` / `LeaseBatchIterator` simplify | none[^1] |
| Querator one-line Lease error fix | none[^2] |
| Querator `Daemon.Shutdown` waits for serve goroutines | none; added `shutdown_test.go`[^3] |
| Querator max-attempts in mongo and postgres stores | none[^4] |
| Gubernator scheduled admission for `max_wait` | none; added `scheduled_admission_test.go`[^5] |

An old suite that stays unedited and still passes after merge shows the tested contracts still hold. Once those proofs are rewritten to match a new implementation, a green suite no longer separates a held contract from a changed one.

## Domains make the freeze possible

A suite that follows private helpers cannot freeze. When those helpers are rearranged, the proofs often have to be rewritten even when the product still does the same thing for callers. The suite then tracks the rearrange instead of the product.

Each problem domain has a public boundary callers depend on. Tests assert what that boundary lets callers observe, not how the internals behind it are arranged. That boundary is what makes the freeze possible.

Querator's store backends sit behind one contract. Mongo and Postgres gained max-attempts handling and the existing suite stayed unedited.[^4] Two implementations moved. The contract surface did not.

## Freeze the proofs that already passed

When the next diff adds behavior, add proofs. When the next diff only moves internals behind a boundary, the proofs that already passed still describe the product. That distinction stays meaningful only while the old tests stay unedited.

[^1]: https://github.com/kapetan-io/querator/pull/80
[^2]: https://github.com/kapetan-io/querator/pull/81
[^3]: https://github.com/kapetan-io/querator/pull/74
[^4]: https://github.com/kapetan-io/querator/pull/72
[^5]: https://github.com/gubernator-io/gubernator/pull/135
