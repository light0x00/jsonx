import { RegexpLexer } from "../compiler/lexer"
import parser from "../compiler/parser"
import { ParseVisitor } from "../compiler/interp"

let visitor = new ParseVisitor()
function parse(str: string): Object {
	let ast = parser.parse(new RegexpLexer(str))
	let r = visitor.apply(ast)
	return r
}

//可能会扩展parse为可配置,此方法用于向后兼容
export function createParse() {
	return { apply: parse }
}