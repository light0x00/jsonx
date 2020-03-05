# JSONX

A JSON Extension Implementation for Javascript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  <a href="https://travis-ci.com/light0x00/jsonx"><img src="https://travis-ci.com/light0x00/jsonx.svg?branch=master"></a>  <a href="https://www.npmjs.com/package/@light0x00/jsonx"><img src="https://img.shields.io/npm/v/@light0x00/jsonx"></a>

## 特性

**自定义转换规则**

每当遇到匹配的类型时,都会调用指定的转换器函数,传入待转换数据,返回值将决定该匹配数据的序列化结果.

支持两种转换器:

- **class conveter** ,按类型匹配

	```ts
	let jsonx = new JSONXBuilder()
		.addClassConverter(Date, (d: Date) => d.getFullYear()+"-"+d.getMonth())
		.build()

	jsonx.stringify({date:new Date()}  //output:  "{"date":"2020-2"}"
	```
- **property conveter**, 按属性名称匹配

	```ts
	let jsonx = new JSONXBuilder()
		.addPropertyConverter("map", (obj: Map<any, any>) => Array.from(obj.entries()))
		.build()

	let r = jsonx.stringify({ map: new Map([["key1", "val1"]]) })
	console.log(r)  //output: {"map":[["key1","val1"]]}
	```



**宽松的分析规则**

支持注释、未闭合的逗号

```ts
let r = JSONX.parse(`{
	/* Some comments */
	"target": "ESNext", //Some comments
	"lib": [
		"ESNext", /* multiline comment is supported */
		null  //null is supported
	], //unclosed comma is supported
}`)
console.log(r)  //output: {"target":"ESNext","lib": ["ESNext",null]}
```


**精确的错误报告**

当格式错误时,指示预期的内容,并显示错误位置

```ts
let r = JSONX.parse(`{
	"target":"ESNext",
	:
 }`)
//Error: The expected input is "}" or "STRING" ,but got ":" at (3,1) ~ (3,2)
```

> 定位信息格式为: (起始行,起始列) ~ (结束行,结束列)


**环依赖检测**

当存在循环引用时,报告整个依赖链

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


## 安装

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

## 使用案例

同时支持esm和cjs, 下面将以esm为例.

**基本使用**

```ts
import JSONX from "@light0x00/jsonx"

JSONX.parse(`{"foo":"bar"}`)
JSONX.parse(`["foo","bar"]`)

JSONX.stringify({foo:"bar"})
JSONX.stringify(["foo","bar"])

//默认会将Date类型的转换规则为: `dateObj.toISOString()`
let r  =JSONX.stringify([new Date()])
console.log(r)  //output: ["2020-03-04T06:24:02.927Z"]
```

**自定义**

```ts
import { JSONXBuilder } from "@light0x00/jsonx"

//组装一个符合你的需求的 JSONX 对象
let jsonx = new JSONXBuilder()
	.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
	.addPropertyConverter("relationships", (obj: Map<string, string>) => Array.from(obj.entries()))
	.build()

//使用它
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

//结果
should(r).eql(`{"name":"foo","date":"${d.date.toLocaleDateString()}","members":[{"name":"alice"},{"name":"bob"}],"relationships":[["alice","bob"]]}`)
```