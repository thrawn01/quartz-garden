---
tags:
  - databases
  - slatedb
---
https://github.com/facebook/rocksdb/wiki/RocksDB-Overview
![](https://user-images.githubusercontent.com/62277872/119747261-310fb300-be47-11eb-92c3-c11719fa8a0c.png)

### SSTable Format V0
The SST is read starting from bottom to top, starting with `Offset of SsTableInfoT`

```
+-----------------------------------------------+  
|               SSTable                         |  
+-----------------------------------------------+  
|  +-----------------------------------------+  |  
|  |  List of Blocks                         |  |  
|  |  +-----------------------------------+  |  |  
|  |  |  block.Block                      |  |  |
|  |  |  +-------------------------------+|  |  |  
|  |  |  |  List of KeyValue pairs        |  |  |  
|  |  |  |  +---------------------------+ |  |  |  
|  |  |  |  |  Key Length (2 bytes)     | |  |  |  
|  |  |  |  |  Key                      | |  |  |  
|  |  |  |  |  Value Length (4 bytes)   | |  |  |  
|  |  |  |  |  Value                    | |  |  |  
|  |  |  |  +---------------------------+ |  |  |  
|  |  |  |  ...                           |  |  |  
|  |  |  +-------------------------------+|  |  |  
|  |  |  |  Offsets for each Key          |  |  |  
|  |  |  |  (n * 2 bytes)                 |  |  |  
|  |  |  +-------------------------------+|  |  |  
|  |  |  |  Number of Offsets (2 bytes)   |  |  |  
|  |  |  +-------------------------------+|  |  |  
|  |  |  |  Checksum (4 bytes)            |  |  |  
|  |  +-----------------------------------+  |  |  
|  |  ...                                    |  |  
|  +-----------------------------------------+  |  
|                                               |  
|  +-----------------------------------------+  |  
|  |  bloom.Filter (if MinFilterKeys met)    |  |
|  +-----------------------------------------+  |  
|                                               |  
|  +-----------------------------------------+  |  
|  |  flatbuf.SsTableIndexT                  |  |
|  |  (List of Block Offsets)                |  |  
|  |  - Block Offset (Start of Block)        |  |  
|  |  - FirstKey of this Block               |  |  
|  |  ...                                    |  |  
|  +-----------------------------------------+  |  
|                                               |  
|  +-----------------------------------------+  |  
|  |  flatbuf.SsTableInfoT                   |  |
|  |  - FirstKey of the SSTable              |  |  
|  |  - Offset of bloom.Filter               |  |
|  |  - Length of bloom.Filter               |  |
|  |  - Offset of flatbuf.SsTableIndexT      |  |
|  |  - Length of flatbuf.SsTableIndexT      |  |
|  |  - The Compression Codec                |  |  
|  +-----------------------------------------+  |  
|  |  Checksum of SsTableInfoT (4 bytes)     |  |  
|  +-----------------------------------------+  |  
|                                               |  
|  +-----------------------------------------+  |  
|  |  Offset of SsTableInfoT (4 bytes)       |  |  
|  +-----------------------------------------+  |  
+-----------------------------------------------+
```

#### Key Value encoding for the v0

| uint16       | uint16       | []byte    | uint64 | uint8 | int64    | int64     | uint32   | []byte |
| ------------ | ------------ | --------- | ------ | ----- | -------- | --------- | -------- | ------ |
| KeyPrefixLen | KeySuffixLen | KeySuffix | seq    | flags | expireAt | createdAt | valueLen | value  |

##### Tombstone format

| uint16       | uint16       | []byte    | uint64 | uint8 | int64     |
| ------------ | ------------ | --------- | ------ | ----- | --------- |
| KeyPrefixLen | KeySuffixLen | KeySuffix | seq    | flags | createdAt |

| Field          | Type     | Description                                         |     |
| -------------- | -------- | --------------------------------------------------- | --- |
| `KeyPrefixLen` | `uint16` | Length of the key prefix                            |     |
| `KeySuffixLen` | `uint16` | Length of the key suffix                            |     |
| `KeySuffix`    | `[]byte` | Suffix of the key                                   |     |
| `seq`          | `uint64` | Sequence Number                                     |     |
| `flags`        | `uint8`  | Flags of the row                                    |     |
| `expireAt`     | `int64`  | Optional, only has value when flags & FlagHasExpire |     |
| `createdAt`    | `int64`  | Optional, only has value when flags & FlagHasCreate |     |
| `value_len`    | `uint32` | Length of the value                                 |     |
| `value`        | `[]byte` | Value bytes                                         |     |
 
NOTE: both expireAt and createdAt are unix epoch

### Trie based SSTs
We may consider moving toward a Trie based SST instead of using a bloom filter.
See https://x.com/debasishg/status/1871091225383821622?t=PfOw7F5vE4SLwZhG5u-Heg&s=19
PDF: https://t.co/4DENC3z0tk

A Trie implementation 
https://github.com/dghubble/trie

I also developed a trie for Mailgun I never used, I may want to resurrect that. 

