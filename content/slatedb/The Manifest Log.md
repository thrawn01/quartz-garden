---
tags:
  - databases
  - slatedb
---
## The Manifest
The manifest file is essential for maintaining database consistency, managing SST files, and managing the current state of the database. It is a critical component of SlateDB's architecture, ensuring that the database remains in a consistent state even after failures or restarts.

The Manifest is designed to:
- Enable Writers, Compaction and Readers to run in different processes and different machines
- Fence multiple writers from updating the database simultaneously
- Track database checkpoints
#### Manifest Files
Manifest files are stored in files named `manifest/<manifest-id>.manifest` where each update to the manifest file is written as a new file with the current manifest id incremented by one.

To illustrate, the first manifest in a new database is  `00000000000000000000.manifest` the next update to the manifest results in a manifest file of `00000000000000000001.manifest`, with each resulting update creating a new manifest file in sequence `00000000000000000002.manifest`, `00000000000000000003.manifest`  and so on. A directory listing of the manifest files looks like the following after 3 updates to a manifest file in the `db1` database.

```
db1/manifest/00000000000000000000.manifest
db1/manifest/00000000000000000001.manifest
db1/manifest/00000000000000000002.manifest
db1/manifest/00000000000000000003.manifest
```

> The manifest with the highest manifest id is considered the current manifest.
#### Manifest Updates
Going forward, when this document refers to updating the manifest, we do not mean the manifest was updated in place, instead the current manifest had changes applied, and a new version of the manifest is written as described previously.

The manifest file is updated in the following scenarios
- When the database is opened for write, `write_epoch` is incremented once
- When the database is opened and compaction is enabled, `compactor_epoch` is incremented once
- When compaction finishes it's current cycle
- When "MemTables" are flushed to the store

If updates occur too frequently, there might be conflict between the SlateDB instances. Too many conflicts can lead to starvation, which can slow down SlateDB writes and compaction.
#### Manifest Contents
The manifest contains the following:
- A list of all L0 and Compacted SSTs
- A list of all active checkpoints
- The id of the last WAL file processed by compaction
- The id used to create the next WAL file
- Epochs used for fencing
### Fencing
SlateDB allows you to access the same database using multiple SlateDB instances. However, only one of those instances can write to the database at any given time. SlateDB does not implement a coordination protocol to enforce a single writer, it is up to the operator to implement coordination if that is desired. As a result, It's possible that multiple SlateDB writer instances could be active, or a previous instance of the SlateDB writer failed to shutdown properly. To avoid clobbering writes to the database, fencing is used to prevent write conflicts.
##### Fencing Strategy
During `db::open` an epoch is calculated by reading the epoch in the manifest and incrementing it by one, this only happens once for each call to `db::open`. The incremented epoch is then immediately written to the manifest. A CAS (Compare And Swap) operation provided by the object store is used to ensure multiple SlateDB instances do not attempt to write the manifest with the calculated epoch simultaneously. If multiple instances of SlateDB attempt to `db::open` the same database for write simultaneously, only one will succeed. CAS ensures simultaneous attempts to write the manifest will fail with `db::open` returning a `SlateDBError::ManifestVersionExists` error if CAS fails.

> While epoch typically refers to unix epoch, the epoch used by SlateDB is not based on time, instead it is an incremental counter which is initialized to 0 when the database is first created.

In the scenario below, there are 3 instances which attempt to open `db1` simultaneously
```
SlateDB 01 -> Write db1/manifest/00000000000000000004.manifest ❌
SlateDB 02 -> Write db1/manifest/00000000000000000004.manifest ✅
SlateDB 03 -> Write db1/manifest/00000000000000000004.manifest ❌
```

When writing a manifest file, the `IfNotExist`  CAS operation used, such that the first instance to create the manifest, while all other instances will lose and return an error.

When multiple SlateDB instances attempt to open a database for write in sequence with some time between them (such that they don't encounter a CAS error)
```
 [2024-01-01:12:00:00] SlateDB 01 -> Open db1/
 [2024-01-01:12:00:01] SlateDB 02 -> Open db1/
 [2024-01-01:12:00:02] SlateDB 03 -> Open db1/
```
Then each instance will successfully open the database by reading the most recent manifest in sequence, incrementing the epoch, and successfully writing the manifest.

However, when either instance `SlateDB 01` or `SlateDB 02` attempts to update the manifest when writes occur, they will discover the epoch in the manifest is greater than the epoch they expect. To understand what happens when this occurs, we need to review the Manifest Update Protocol.
### Manifest Update Protocol
The steps for updating a manifest in `db1` are as follows:
1. Retrieve a list of files from `db1/manifest/` which have the suffix `.manifest`
```
db1/manifest/00000000000000000004.manifest
db1/manifest/00000000000000000002.manifest
db1/manifest/00000000000000000001.manifest
db1/manifest/00000000000000000003.manifest
db1/manifest/00000000000000000000.manifest
```
2. Sort the list of files and select the manifest with the largest manifest id
```
db1/manifest/00000000000000000000.manifest
db1/manifest/00000000000000000001.manifest
db1/manifest/00000000000000000002.manifest
db1/manifest/00000000000000000003.manifest
db1/manifest/00000000000000000004.manifest
```
3. Read the  `db1/manifest/00000000000000000004.manifest`  manifest file
4. Apply our changes to the manifest
5. Compare the epoch in the manifest to our epoch. If our epoch is less than the epoch stored in the manifest, then an error is logged, and the manifest update is aborted.
6. Write the modified manifest using the next manifest id number in the sequence. In this case the next number in the sequence is 5 `db1/manifest/00000000000000000005.manifest`. If the manifest write fails with a CAS conflict error, then restart at step 1

Note that SlateDB must restart the entire protocol at step 1, if a CAS conflict occurs. SlateDB must retrieve a new manifest listing in order to discover the most recently updated manifest and re-apply our changes to the manifest. This process will continue to retry indefinitely until manifest write occurs without conflict.

> NOTE: Currently if our epoch is less than the epoch found in the manifest, the manifest update aborts and logs an error without retry. I believe this results in lost writes on the writer that has the skewed epoch. Is this expected? This error is never explicitly handled https://github.com/slatedb/slatedb/blob/604c5330d4c62b64170de5152307c02fe7f6feed/src/manifest_store.rs#L86 here https://github.com/slatedb/slatedb/blob/b9ebbd82e5fd5dd86a2b2aefe8069a9059981691/src/mem_table_flush.rs#L45 The only recourse for the operator in this situation is to close the database and accept the lost writes. However, no error is ever returned, the only way the operator knows there is an issue is if they notice the error in the log and understand what it means.

CAS conflict ensures writes to a file do not clobber each other, while the epoch check enables detection of multiple writers.

TODO: Fencing and Compaction

TODO: When reads occur, how does a SlateDB instance know to refresh pages if there are new keys written by other instances?