---
date: 2024-01-12
tags:
  - programming
  - education
  - thoughts
---
"Clean code" or "Clean Systems" is synonymous with what most people would call "Good Code|Architecture". All good code, like all good systems and architecture share the same characteristic, they make change easy. If the majority of the changes you want to make to your system are easy to make, then it's likely you have clean code.

There is a symbiotic relationship between "clean" systems, and  [Cognitive Load](https://en.wikipedia.org/wiki/Cognitive_load). The ability to grok a system outside of understand the problem domain is the top determining factor in how well clean or good the system is. There are a ton of aspects which make code "clean", which incidentally helps reduce the [Cognitive Load](https://en.wikipedia.org/wiki/Cognitive_load) which also incidentally makes the code easier to change.
### Code Architecture
* [[Separation Of Concerns]]
* [[Domain Driven Design]]
* Data Ownership
### Comments
Comments should NOT explain WHAT the code is doing, (Hopefully that is self advent.) code comments should explain WHY the code is doing what it's doing. 
```go
// Marshal encodes a Trie into a []byte suitable for saving to disk or db
func Marshal(tr *Trie) ([]byte, error) {
    var buf bytes.Buffer
    
    // We add a 2 byte (uint16) version identifier to the start of the buffer
    // so if in the future we change the structure of the *Node tree we can 
    // bump the version number in buffer, which will inform any one reading
    // buffer of what structure is expected.
    var version [2]byte
    binary.LittleEndian.PutUint16(version[:], uint16(1))
    if _, err := buf.Write(version[:]); err != nil {
        return nil, fmt.Errorf("while writing version to buffer: %w", err)
    }

    if err := gob.NewEncoder(&buf).Encode(tr.root); err != nil {
        return nil, fmt.Errorf("while encoding: %w", err)
    }
    return buf.Bytes(), nil
}
```

### Code Patterns
* Follow the [Early return principle](https://www.youtube.com/watch?v=lHvozJj27rs)
- Avoid nested fi/else statements 
- Avoid many method arguments, use an `Option`, `Config` or a `Context` struct/object instead 
- As the function hierarchy increases, consider passing around common state with a context struct/object like `Context`, etc...
- Use result struct/object as the return from a function instead of returning a list of values
- Try to keep methods/functions small. A function should generally accomplish a single thing, avoid over loading what the function does, just because it's simple to add an `if/else`.
- If your function has many things to do, break the things up into separate sub functions which the main function will call in order.
- When starting out, design your interfaces and modules first, use them to layout the entire structure of your code. Then use the interfaces in tests, if it feels natural, then finally fill in the implementation such that the tests pass.
* Don't be afraid to [break the DRY principle](https://matt-rickard.com/dry-considered-harmful) when necessary. AVOID using the DRY Principle in tests. A little duplication is often better than a little dependency See [The Harmful Obsession With DRY](https://salmonmode.github.io/2020/08/14/the-harmful-obsession-with-dry.html) and [The DRY principle is bad advice](https://rotemtam.com/2020/05/18/the-dry-principle-is-bad-advice/)

