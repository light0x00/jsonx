import should from "should"
import JSONX, { Converter, JSONXBuilder } from "~/index"

describe(
	`stringify`, function () {
		it(`primitive`, function () {
			should(JSONX.stringify(123)).eql("123")
			should(JSONX.stringify(123.456)).eql("123.456")
			should(JSONX.stringify("abc")).eql(`"abc"`)
			should(JSONX.stringify(false)).eql("false")
		})
		it(`array`, function () {
			let d = [8, 2, 4, 2, 6, 5]
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`object`, function () {
			let d = { x: "xxx", y: 123, z: false }
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`mixture`, function () {
			let d = { a: 123, b: { b1: "b1b1b1", b2: [1, 2, 3] }, c: [123.456, { x: "x" }] }
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`default date format should be iso`, function () {
			let d = { date: new Date() }
			let r = JSONX.stringify(d)
			should(r).eql(`{"date":"${d.date.toISOString()}"}`)
		})
		it(`custom class converter`, function () {
			{
				let d = [new Date()]
				let jsonx = new JSONXBuilder()
					.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
					.build()
				let r = jsonx.stringify(d)
				should(r).eql(`["${d[0].toLocaleDateString()}"]`)
			}
		})
		it(`custom property converter`, function () {
			let d = { map: new Map([["key1", "val1"]]) }
			let jsonx = new JSONXBuilder()
				.addPropertyConverter("map", (obj: Map<string, string>) => Array.from(obj.entries()))
				.build()
			let r = jsonx.stringify(d)
			should(r).eql(`{"map":[["key1","val1"]]}`)
		})
		it(`mixed stringify`, function () {
			// let d = { map: new Map<any>([["key1", "val1"]]) }
			let d = {
				name: "foo",
				date: new Date(),
				members: [
					{ name: "alice" },
					{ name: "bob" },
					{ name: "jack" },
					{ name: "rose" },
				],
				relationships: new Map<string, string>([["alice", "bob"], ["jack", "rose"]])
			}
			let jsonx = new JSONXBuilder()
				.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
				.addPropertyConverter("relationships", (obj: Map<string, string>) => Array.from(obj.entries()))
				.build()
			let r = jsonx.stringify(d)
			console.log(r)

		})
	}
)