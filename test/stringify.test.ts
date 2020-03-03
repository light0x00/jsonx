import should from "should"
import JSONX, { JSONXBuilder } from "~/index"
import { Member } from "./mock"

describe(
	`JSONX Stringify Test`, () => {
		it(`primitive`, () => {
			should(JSONX.stringify(123)).eql("123")
			should(JSONX.stringify(123.456)).eql("123.456")
			should(JSONX.stringify("abc")).eql(`"abc"`)
			should(JSONX.stringify(false)).eql("false")
		})
		it(`array`, () => {
			let d = [8, 2, 4, 2, 6, 5]
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`object`, () => {
			let d = { x: "xxx", y: 123, z: false }
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`mixture`, () => {
			let d = { a: 123, b: { b1: "b1b1b1", b2: [1, 2, 3] }, c: [123.456, { x: "x" }] }
			let r = JSONX.stringify(d)
			should(r).eql(JSON.stringify(d))
		})
		it(`default date format should be iso`, () => {
			let d = { date: new Date() }
			let r = JSONX.stringify(d)
			should(r).eql(`{"date":"${d.date.toISOString()}"}`)
		})
		it(`custom class converter`, () => {
			{
				let d = [new Date()]
				let jsonx = new JSONXBuilder()
					.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
					.build()
				let r = jsonx.stringify(d)
				should(r).eql(`["${d[0].toLocaleDateString()}"]`)
			}
		})
		it(`custom property converter`, () => {
			let d = { map: new Map([["key1", "val1"]]) }
			let jsonx = new JSONXBuilder()
				.addPropertyConverter("map", (obj: Map<string, string>) => Array.from(obj.entries()))
				.build()
			let r = jsonx.stringify(d)
			should(r).eql(`{"map":[["key1","val1"]]}`)
		})
		it(`mixed stringify`, () => {

			let d = {
				name: "foo",
				date: new Date(),
				members: [
					{ name: "alice" },
					{ name: "bob" },
				],
				relationships: new Map<string, string>([["alice", "bob"]])
			}
			let jsonx = new JSONXBuilder()
				.addClassConverter(Date, (obj: Date) => obj.toLocaleDateString())
				.addPropertyConverter("relationships", (obj: Map<string, string>) => Array.from(obj.entries()))
				.build()
			let r = jsonx.stringify(d)
			should(r).eql(`{"name":"foo","date":"${d.date.toLocaleDateString()}","members":[{"name":"alice"},{"name":"bob"}],"relationships":[["alice","bob"]]}`)

		})
		it(`cycular references detection case1`, () => {
			let jack = new Member("jack")
			let rose = new Member("rose")
			jack.lover = rose
			rose.lover = jack
			should.throws(() => JSONX.stringify(jack))
		})
		it(`cycular references detection case2`, () => {
			let jack = new Member("jack")
			let rose = new Member("rose")
			let alice = new Member("alice")
			let bob = new Member("bob")
			jack.lover = rose
			rose.lover = alice
			alice.lover = bob
			bob.lover = jack
			should.throws(() => JSONX.stringify(jack),
				/jack->rose->alice->bob->jack$/g
			)
		})
		it(`null case`, () => {
			let jack = new Member("jack")
			jack.lover = undefined
			let r = JSONX.stringify(jack)
			should(r).eql(`{"name":"jack","lover":null}`)
			console.log(r)
		})
	}
)
