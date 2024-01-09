---
title: Delimited Stream Processing in Golang
date: 2016-10-17T19:14:56-05:00
draft: false
tags:
  - golang
  - programming
  - parsing
---

Every time I need to process a stream of data two things are usually true.

**A** I need to breakup a stream of data into smaller chunks I can then process.
**B** I have to code the buffering of the stream manually. This involves
reading in a chunk from the stream, then searching the chunk for the data I
want, then fetching another chunk, and so on. In most languages this results in
a non trivial bit of code.

At [maligun.com](http://mailgun.com) we use Kafka for our event processing, as
such I wrote a CLI tool to send a piped stream of events to Kafka. Kafka can
accept any number serialization protocols in the event payload, which means it
could be anything from JSON to Protobuf. As such I choose to delimit events by
CR, \r,  (Carriage Return). So the program should read chunks of data into a
buffer until it finds a CR or EOF then post the payload to Kafka on a topic
indicated by a command line option.

Because this is a CLI and I want to pipe events from a file, or another program
that generates events, our program will read from ```os.Stdin```. Normally we would
have to write the buffering and searching portion ourselves. Except golang has
a surprise called the [buffo.Scanner](https://golang.org/pkg/bufio/#Scanner).
Of course you can browse the documentation, but lets look at an implementation
I wrote called `EventReader`. For simplicity sake ```ReadEvent()``` will return a
new `[]btye` for each event it reads from the stream.

Here is how the ```main()``` in our CLI will use it

```go
for reader := NewEventReader(os.Stdin); ; {
    eventPayload, err := reader.ReadEvent()
    if err != nil {
        if err != io.EOF {
           checkErr("read from stdin failed with", err)
        }
        os.Exit(0)
    }
    resp, err := kafka.SendEvent(context.Background(), “my-topic”, ‘my-hash’,
      eventPayload)
    if err != nil {
        fmt.Fprintf(os.Stderr, “SendEvent failed with - %s\n", err)
        fmt.Fprintln(os.Stderr, string(resp))
        os.Exit(1)
    }
    fmt.Println(string(resp))
}
```

Here is our implementation of ```EventReader```

```go
import (
      "bufio"
      "bytes"
      "io"
)

type EventReader struct {
      scanner *bufio.Scanner
      buffer  []byte
      idx    int
}

func NewEventReader(source io.Reader) *EventReader {
      scanner := bufio.NewScanner(source)
      split := func(data []byte, atEOF bool) (advance int, data []byte, err error) {
              if atEOF && len(data) == 0 {
                    return 0, nil, nil
              }
              if i := bytes.IndexByte(data, '\r'); i >= 0 {
                    // We have a full event
                    return i + 1, data[0:i], nil
              }
              // If we're at EOF, we have a final event
              if atEOF {
                    return len(data), data, nil
              }
              // Request more data.
              return 0, nil, nil
      }
      // Set the split function for the scanning operation.
      scanner.Split(split)

      return &EventReader{
              scanner: scanner,
      }
}

func (self *EventReader) ReadEvent() ([]byte, error) {
      if self.scanner.Scan() {
              event := self.scanner.Bytes()
              return event, nil
      }
      if err := self.scanner.Err(); err != nil {
              return nil, err
      }
      return nil, io.EOF
}
```

The cool part is the `split` function. This function gets passed the contents
of the currently buffered read. This allows us to search the current buffer for
our delimiter (In this case \r) if we find it, we return how many bytes the
buffer should `advance` before giving us data again and we return the `data`
the scanner should return to the caller.   If we don’t find our delimiter, we
return `0, nil, nil` which tells to scanner read more data into the buffer and
call us again.

I for one was very happy to find this in the golang standard library. Thank you golang authors.
