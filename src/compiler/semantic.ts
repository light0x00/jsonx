import { FactorNode, EntryNode, EntriesNode, ObjectNode, ItemsNode, ArrayNode, JSONNode } from "./ast"
import { Token } from "./lexer"

interface ASTVisitor {
	visitFactor(node: FactorNode): void
	visitEntry(node: EntryNode): void
	visitEntries(node: EntriesNode): void
	visitObject(node: ObjectNode): void
	visitItems(node: ItemsNode): void
	visitArray(node: ArrayNode): void
	visitJSON(node: JSONNode): void
}

export class ParseVisitor implements ASTVisitor {

	apply(ast: JSONNode) : Object{
		return this.visitJSON(ast)
	}

	visitFactor(node: FactorNode):Object {
		if (node.children[0] instanceof Token) {
			return node.children[0].lexval
		} else if (node.children[0] instanceof ObjectNode) {
			return this.visitObject(node.children[0])
		}
		else if (node.children[0] instanceof ArrayNode) {
			return this.visitArray(node.children[0])
		} else {
			throw Error("parse error")
		}
	}
	visitEntry(node: EntryNode): [string, Object] {
		return [node.key.str, this.visitFactor(node.val)]
	}
	visitEntries(node: EntriesNode): [string, Object][] {
		let r = [this.visitEntry(node.entry)]
		if (node.nextEntries != undefined)
			r.push(...this.visitEntries(node.nextEntries))
		return r
	}
	visitObject(node: ObjectNode): object {
		let obj: { [index: string]: Object } = {}
		for (let [k, v] of this.visitEntries(node.entries)) {
			obj[k] = v
		}
		return obj
	}
	visitItems(node: ItemsNode): Object[] {
		let r = [this.visitFactor(node.item)]
		if (node.nextItems != undefined)
			r.push(...this.visitItems(node.nextItems))
		return r
	}
	visitArray(node: ArrayNode): Object[] {
		return this.visitItems(node.items)
	}
	visitJSON(node: JSONNode): Object {
		return this.visitFactor(node.factor)
	}
}