import { RegexpLexer } from "../compiler/lexer"
import parser from "../compiler/parser"
import { ParseVisitor } from "../compiler/semantic"

let visitor = new ParseVisitor()
function parse(str: string) {
	return visitor.apply(parser.parse(new RegexpLexer(str)))
}

//可能会扩展parse为可配置,此方法用于向后兼容
export function createParse() {
	return { apply: parse }
}