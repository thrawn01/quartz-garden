---
title: Inspecting Variables in a Golang Package
tags:
  - golang
  - programming
  - parsing
date: 2018-01-11T13:33:03-06:00
draft: false
---

Google doesn't have much on this topic, so here is what I found.
<!--more-->
1. You can't use `reflect` to inspect a package at runtime.
2. You can use `go/parser` to inspect the package if you have access to the source code

I needed to inspect a package to facilitate generating code at compile time. So
the `go/parser` route worked fine for me.

The following code prints out the `types` and `consts` and `functions`
found in the files of the `./events_pb` package.

```go
package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path"
	"strings"
)

func checkErr(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "-- %s\n", err)
		os.Exit(1)
	}
}

// Specify what files to parser
func onlyProtoBufFiles(info os.FileInfo) bool {
	if strings.HasSuffix(info.Name(), ".pb.go") {
		return true
	}
	return false
}

func main() {
	pwd, err := os.Getwd()
	checkErr(err)

	dir := path.Join(pwd, "events_pb")
	pkgs, err := parser.ParseDir(token.NewFileSet(), dir, onlyProtoBufFiles, 0)
	if err != nil {
		return
	}
	for _, pkg := range pkgs {
		for source, f := range pkg.Files {
			source = path.Base(source)
			for name, object := range f.Scope.Objects {
				if object.Kind == ast.Typ {
					fmt.Printf("%s: Type: %s\n", source, name)
				}
				if object.Kind == ast.Con {
					fmt.Printf("%s: Const: %s\n", source, name)
				}
				if object.Kind == ast.Fun {
					fmt.Printf("%s: Functions: %s\n", source, name)
				}
			}
		}
	}
}
```

Output looks like this
```bash

 fixtures.pb.go: Type: Bar
 fixtures.pb.go: Type: Blah
 fixtures.pb.go: Type: Bazz
 fixtures.pb.go: Type: Foo
 meta.pb.go: Const: Meta_FOO
 meta.pb.go: Const: Meta_BAR
 ...

```
