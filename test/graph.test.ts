import { isPrimitive } from "~/common"
import { Gragh } from "~/common"
import should from "should"
import { Member,Group } from "./mock"

function traverseCycle(obj: Object, g: Gragh<any>): any[] {
	if (isPrimitive(obj)) {/*  */}
	//Array or Object
	else {
		for (let [, v] of Object.entries(obj)) {
			if (!isPrimitive(v)) {
				g.addEdges(obj, v)
				let path = g.path(v, obj)
				if (path.length > 0) {
					// throw new Error(`Cycle between ${obj} and ${v}`)
					return path
				}
				let path2 = traverseCycle(v, g)
				if (path2.length > 0) {
					return path2
				}
			}

		}
	}
	return []
}

describe(`Graph Test`, () => {
	it(`Circular Case1`, () => {
		let group = new Group("Group1")
		let jack = new Member("jack")
		let rose = new Member("rose")
		jack.group = group
		jack.lover=rose
		group.members = [jack, rose]
		let cycle = traverseCycle(jack, new Gragh())
		should(cycle).length(3)
		should(cycle).containEql(group.members)
		should(cycle).containEql(group)
		should(cycle).containEql(jack)
	})
	it(`Circular Case2`, () => {
		let jack = new Member("jack")
		let rose = new Member("rose")
		jack.lover = rose
		rose.lover = jack
		let cycle = traverseCycle(jack, new Gragh())
		should(cycle).length(2)
		should(cycle).containEql(jack)
		should(cycle).containEql(rose)
	})

	it(`Circular Case3`, () => {
		let alice = new Member("alice")
		let bob = new Member("bob")
		let trunk = new Member("trunk")
		alice.lover = bob
		bob.lover = trunk
		trunk.lover = alice
		let cycle = traverseCycle(alice, new Gragh())
		should(cycle).length(3)
		should(cycle).containEql(alice)
		should(cycle).containEql(bob)
		should(cycle).containEql(trunk)
	})

	it(`Circular case4`, () => {
		let alice = new Member("alice")
		let bob = new Member("bob")
		alice.lover = bob
		let group = new Group("Group1")
		group.members=[bob]
		alice.group = group
		let cycle = traverseCycle(alice, new Gragh())
		should(cycle).length(0)
	})
})