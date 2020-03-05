import should from "should"
import { RegexpLexer } from "~/compiler/lexer"
import { getMock } from "./mock"
import { EOF } from "@parser-generator/definition"

describe(`Lexer Test`, () => {
	describe(`token patterns`, () => {

		it(`comment`, function () {
			let regex = /(?<comment>\/\/[^\n]*)/y
			should(regex.exec("//aaa\nbbb")![0]).equal("//aaa")
		})

		it(`multi comment`, () => {
			let multiRe = /^[/][*]{1,2}(?<value>(.|\s)+?)[*][/]$/
			{
				multiRe.lastIndex = 0
				let r = multiRe.exec(`/*abc*/`)
				should(r).not.null()
				should(r![1]).eql("abc")
			}
			{
				let r = multiRe.exec(`/**xyz*/`)
				multiRe.lastIndex = 0
				should(r).not.null()
				should(r![1]).eql("xyz")
			}
		})

		it(`float`, function () {
			let regex = /^([1-9]\d*\.\d+)|(0\.\d+)$/

			should(regex.test("123.456")).be.true()
			should(regex.test("0.456")).be.true()
			should(regex.test(".456")).be.false()
			should(regex.test("01.456")).be.false()
			should(regex.test("0.456a")).be.false()
		})

		it(`int`, function () {
			let regex = /^((0(?![0-9]))|([1-9]\d*(?!\.)))$/
			should(regex.test("000")).be.false()
			should(regex.test("01")).be.false()
			should(regex.test("1.2")).be.false()
			should(regex.test("12")).be.true()
			should(regex.test("0")).be.true()
		})

		it(`identifier or reserved key`, function () {
			let regex = /^[A-Z_a-z]\w*$/

			should(regex.test("a1")).be.true()
			should(regex.test("a1_")).be.true()
			should(regex.test("_a1")).be.true()
			should(regex.test("1a_")).be.false()
		})

		it(`string`, function () {
			let regex = /^"(?<value>(\\"|\\\\|\\n|\\t|[^"])*)"$/
			let str = getMock("string.txt")
			should(regex.test(str)).is.true()
		})

	})

	describe(`Intergration Test`, () => {
		let getTokenVals = (lexer: RegexpLexer) => {
			let result = []
			let token
			while ((token = lexer.next()).key() != EOF) {
				result.push(token.lexval)
			}
			return result
		}

		it(`case1`, () => {
			let str = `{ "a":123 }`
			let expected = ["{", "a", ":", 123, "}"]
			let actual = getTokenVals(new RegexpLexer(str))
			should(actual).eql(expected)
		})

		it(`case2`, () => {
			let str = `
			{ "a":false }
			`
			let expected = ["{", "a", ":", false, "}"]
			let actual = getTokenVals(new RegexpLexer(str))
			should(actual).eql(expected)
		})

		it(`case3`, () => {
			let str = `
			{ "a":123.456 }
			`
			let expected = ["{", "a", ":", 123.456, "}"]
			let actual = getTokenVals(new RegexpLexer(str))
			should(actual).eql(expected)
		})

		it(`case4`, () => {
			let str = `
			{ "a":"\\"foo bar\\"" }
			`
			let expected = ["{", "a", ":", "\"foo bar\"", "}"]
			let actual = getTokenVals(new RegexpLexer(str))
			should(actual).eql(expected)
		})

		it(`case5 null`, () => {
			let str = `
			{ "a":null}
			`
			let expected = ["{", "a", ":", null, "}"]
			let actual = getTokenVals(new RegexpLexer(str))
			should(actual).eql(expected)
		})
	})

})

import parser from "~/compiler/parser"
import { ParseVisitor } from "~/compiler/semantic"
describe(`Parser Test`, () => {
	it(`case1`, () => {
		let str = getMock("1.json.txt")
		let ast = parser.parse(new RegexpLexer(str))
		let r = new ParseVisitor().apply(ast)
		should(r).eql({
			"key0": 123,
			"key1": 123.456,
			"key2": -123.456,
			"key3": "abc",
			"key4": false,
			"key5": {
				"foo": "foooo",
				"bar": "barrr"
			},
			"key6": [
				"foo",
				"bar"
			],
			"key7":null
		})
	})
	it(`case2`, () => {
		let str = getMock("2.json.txt")
		let ast = parser.parse(new RegexpLexer(str))
		let r = new ParseVisitor().apply(ast)
		should(r).eql({
			"target": "ESNext",
			"lib": [
				"ESNext",
				null
			],
		})
	})
})

import jsonx from "~/index"

describe(`JSONX Parse Test`, () => {
	it(`case1`, () => {
		let r = jsonx.parse(getMock("2.json.txt"))
		should(r).eql({
			"target": "ESNext",
			"lib": [
				"ESNext",
				null
			],
		})
	})
})