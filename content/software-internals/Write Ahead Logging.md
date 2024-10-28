---
tags:
  - databases
  - software-internals
---

## WAL Checksums
> "sqlite has no checksums and is thus irresponsible for production use" -- Miller

Discussion regarding the reliability of transactions when used in database systems that employ a WAL without checksums to verify the integrity of the transaction. 

### SQLite has no WAL checksum warnings
> By default SQLite assumes that the detection and/or correction of bit errors caused by cosmic rays, thermal noise, quantum fluctuations, device driver bugs, or other mechanisms, is the responsibility of the underlying hardware and operating system. SQLite does not add any redundancy to the database file for the purpose of detecting corruption or I/O errors. SQLite assumes that the data it reads is exactly the same data that it previously wrote. https://www.sqlite.org/atomiccommit.html

> A simple bit flip in the WAL can silently lose committed entries. This is because when a corrupted entry is found in the log, SQLite truncates it, despite the existence of successfully committed entries later in the log. https://github.com/danthegoodman1/BreakingSQLite 

V on twitter notes:
> SQLite does have checksums for WAL, but not for main db file. That needs to be enabled separately via an extension

While SQLite DOES have a checksum in the WAL file format, which is specified [here](https://www.sqlite.org/fileformat2.html#checksum_algorithm) under the heading "Checksum Algorithm", when SQLite encounters a checksum error it silently drops the frames instead of complaining, which results in silently losing transactions the user previously thought were committed.

### CRDB has no WAL checksums
>FROM: Cockroach Labs Support, Oct. 3 2024:
> _”As you surmised when it comes to SSTs CRDB does have mechanisms to detect and handle bit rot, particularly in its distributed storage system. When data is stored in SST (Sorted String Table) files, the distributed nature of CRDB allows it to recover from such corruption by replicating data across multiple nodes._
 > _However, when it comes to the Write-Ahead Log (WAL), the situation is more complex. If there is corruption in the middle of the WAL, CRDB does not have a built-in mechanism to repair the corrupted WAL entries. Instead, it follows a similar approach to other SQL databases like SQLite and PostgreSQL, where the corrupted WAL would be truncated, potentially leading to the loss of commits that occurred after the corrupted data._
 > _That isn't to say we've abandoned the idea of being able to handle WAL corruption we just haven't landed on a solution and are still iin the process of theory-crafting it._

### AWS Aurora has WAL checksums
> _AWS, Oct. 3 2024:_
> _”In the event of bit-rot or any corruption in the WAL file, Amazon Aurora automatically detects the issue using checksums and repairs the corrupted data by retrieving valid copies from other storage nodes. It does not truncate the WAL; instead, it repairs it to ensure data integrity and availability.”_

> The only ones I know of that are truly safe are AWS aurora, tigerbeetle, and foundationdb -- Dan

