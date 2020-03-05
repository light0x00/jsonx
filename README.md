# JSONX

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  <a href="https://travis-ci.com/light0x00/jsonx"><img src="https://travis-ci.com/light0x00/jsonx.svg?branch=master"></a>  <a href="https://www.npmjs.com/package/@light0x00/jsonx"><img src="https://img.shields.io/npm/v/@light0x00/jsonx"></a>

[中文文档](./README.zh.md)

## Features

**Customizable converter**

Whenever matching data is encountered,  the specified converter-function is called,  and the return value determines the converting result of the matching data.

Two types of converters are supported:

- **class conveter** ,Match by Class (`xx.constructor`)
	```ts
	let jsonx = new JSONXBuilder()
		.addClassConverter(Date, (d: Date) => d.getFullYear()+"-"+d.getMonth())
		.build()
	jsonx.stringify({date:new Date()}  //output: "{"date":"2020-2"}"
	```
- **property conveter**, Match by property name

	```ts
	let jsonx = new JSONXBuilder()
		.addPropertyConverter("map", (obj: Map<any, any>) => Array.from(obj.entries()))
		.build()
	let r = jsonx.stringify( { map: new Map([["key1", "val1"]]) } )
	console.log(r)  //output: {"map":[["key1","val1"]]}
	```

**Loose analysis rules**

The comment、unclosed comma are supported

```ts
let r = jsonx.parse(`{
	/* Some comments */
	"target": "ESNext", //Some comments
	"lib": [
		"ESNext", /* multiline comment is supported */
		null  //null is supported
	], //unclosed comma is supported
}`)
console.log(r)  //output: {"target":"ESNext","lib": ["ESNext",null]}
```

**Detailed error reports**

When an error occurs, report the expected content, and the error location

```ts
let r = jsonx.parse(`{
	"target":"ESNext",
	:
 }`)

//Error: The expected input is "}" or "STRING" ,but got ":" at (3,1) ~ (3,2)
```

> The location format where error occurred: (start row,start column) ~ (end row,end column)


**Circular references detection**

When a circular reference detected, report the reference chain

```ts
class Member {
	name: string;
	lover?: Member;
	constructor(name: string) {
		this.name = name
	}
	toString() { return this.name }
}

let jack = new Member("jack")
let rose = new Member("rose")
let alice = new Member("alice")
let bob = new Member("bob")
jack.lover = rose
rose.lover = alice
alice.lover = bob
bob.lover = jack

jsonx.stringify(jack)
// Error: circular references detected: jack->rose->alice->bob->jack
```

## Install


**npm**

```bash
npm install @light0x00/jsonx
```

**browser**

```html
<script src="path/to/jsonx.min.js"></script>
<script>
	let {default: JSONX , JSONXBuilder } = JSONX_LIB 
</script>
```

## Usage

Support both ESModule and CommonJS, use ESModule as example below.

**Basic usage**

```ts
import JSONX from "@light0x00/jsonx"

JSONX.parse(`{"foo":"bar"}`)
JSONX.parse(`["foo","bar"]`)

JSONX.stringify({foo:"bar"})
JSONX.stringify(["foo","bar"])

//By default `Date` type is converted to : `dateObj.toISOString()`
let r  =JSONX.stringify([new Date()])
console.log(r)  //output: ["2020-03-04T06:24:02.927Z"]
```

**Customized usage**

```ts
import { JSONXBuilder } from "@light0x00/jsonx"

//Build a `JSONX` object according your demand
let jsonx = new JSONXBuilder()
	.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
	.addPropertyConverter("relationships", (obj: Map<string, string>) => Array.from(obj.entries()))
	.build()

//Use it
let d = {
	name: "foo",
	date: new Date(),
	members: [
		{ name: "alice" },
		{ name: "bob" },
	],
	relationships: new Map<string, string>([["alice", "bob"]])
}
let r = jsonx.stringify(d)

//Result
should(r).eql(`{"name":"foo","date":"${d.date.toLocaleDateString()}","members":[{"name":"alice"},{"name":"bob"}],"relationships":[["alice","bob"]]}`)
```