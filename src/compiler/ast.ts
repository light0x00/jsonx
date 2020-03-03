import { Token } from "./lexer"
import { ASTElement } from "@parser-generator/definition"

abstract class ASTNode {
	readonly children: ASTElement[]
	constructor(children: ASTElement[]) {
		this.children = children
	}
}

export class FactorNode extends ASTNode {

}

export class EntryNode extends ASTNode {
	get key(): Token {
		return this.children[0] as Token
	}
	get val(): FactorNode {
		return this.children[2] as FactorNode
	}
}

export class EntriesNode extends ASTNode {

	get entry(): EntryNode {
		return this.children[0] as EntryNode
	}
	get nextEntries(): EntriesNode | undefined {
		return this.children[2] as EntriesNode
	}
}

export class ObjectNode extends ASTNode {
	get entries(): EntriesNode {
		return this.children[1] as EntriesNode
	}
}

export class ItemsNode extends ASTNode {
	get item(): FactorNode {
		return this.children[0] as FactorNode
	}
	get nextItems(): ItemsNode {
		return this.children[2] as ItemsNode
	}
}

export class ArrayNode extends ASTNode {
	get items() {
		return this.children[1] as ItemsNode
	}
}

export class JSONNode extends ASTNode {

	get factor() {
		return this.children[0] as FactorNode
	}

}

