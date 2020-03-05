import { RegexpLexer } from "../compiler/lexer"
import parser from "../compiler/parser"
import { ParseVisitor } from "../compiler/semantic"
import { logger } from "../common"

let visitor = new ParseVisitor()
function parse(str: string): Object {
	logger("parse begin")
	let ast = parser.parse(new RegexpLexer(str))
	logger("parse end,interp start")
	let r = visitor.apply(ast)
	logger("interp end")
	return r
}

//可能会扩展parse为可配置,此方法用于向后兼容
export function createParse() {
	return { apply: parse }
}