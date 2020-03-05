// import { logger } from "../common"
import { IToken, Terminal, TokenPro, EOF, ILexer } from "@parser-generator/definition"

enum Tag {
	BLANK = "BLANK",
	COMMENT = "COMMENT",
	MULTI_COMMENT = "MULTI_COMMENT",
	WORD = "WORD",/* 关键字 或 变量标识符 */

	SINGLE = "SINGLE", /* 单个字符(同一符号在不同上下文拥有不同语义,比如`-`可作双目符号(减号), 也可作单目符号(负号) ) */
	ID = "ID",
	/* 字面量 */
	NUM = "NUM",
	REAL = "REAL",
	STRING = "STRING",
	BOOL = "BOOL",
	NULL = "NULL",
	/* 特殊 */
	EOF = "EOF"
}

type TokenConstructorArgs = {
	lexeme: string, //原始词素 字符形式
	lexval: any,  //词素的实际值 (默认为 lexeme)
	tag: Tag, //类型
	proto?: TokenPro, //词元 (默认为lexeme)
	lineBegin?: number, colBegin?: number, lineEnd?: number, colEnd?: number
}

export class Token implements IToken {

	protected _proto: Terminal
	protected _lexeme: string;
	protected _lexval: any;
	protected _tag: Tag;

	protected _lineBegin: number = -1
	protected _colBegin: number = -1
	protected _lineEnd: number = -1
	protected _colEnd: number = -1

	constructor(args: TokenConstructorArgs) {
		let { proto, tag, lexeme, lexval } = args
		this._proto = proto ?? lexeme
		this._tag = tag
		this._lexeme = lexeme
		this._lexval = lexval

		this._lineBegin = args.lineBegin ?? -1
		this._lineEnd = args.lineEnd ?? this._lineBegin
		this._colBegin = args.colBegin ?? -1
		this._colEnd = args.colEnd ?? this._colBegin
	}
	key() {
		return this._proto
	}
	get tag(): Tag {
		return this._tag
	}
	get lexeme(): string {
		return this._lexeme
	}
	get lexval(): any {
		return this._lexval
	}
	get num(): number {
		return this._lexval as number
	}
	get bool(): boolean {
		return this._lexval as boolean
	}
	get str(): string {
		return this._lexval as string
	}
	toString(): string {
		return this._lexeme
	}

	getLocaltion(): string {
		return `(${this._lineBegin},${this._colBegin}) ~ (${this._lineEnd},${this._colEnd})`
	}
	setLocation(lineBegin: number, colBegin: number, lineEnd: number, colEnd: number) {
		this._lineBegin = lineBegin
		this._colBegin = colBegin
		this._lineEnd = lineEnd
		this._colEnd = colEnd
	}
}

// import { Queue } from "@light0x00/shim"
import { Queue } from "typescript-collections"

export abstract class AbstractLexer<T>{

	private _buffer = new Queue<T>();
	/**
	 * 预读
	 */
	peek(): T {
		return this.peekFor(0)
	}
	/**
	 * 预读指定位置
	 * @param i 
	 */
	private peekFor(i: number): T {
		if (this.fill(i)) {
			return this._buffer.peek()!
		} else {
			return this.getEOF()
		}
	}
	/**
	 * 消费token
	 */
	next(): T {
		if (this.fill(0))
			return this._buffer.dequeue()!
		else
			return this.getEOF()
	}

	/**
	 * 填充直到队列达到指定数量,或没有足够的输入符号.
	 * 如果填充达到要求的数量,返回true,否则false
	 * @param i
	 */
	private fill(i: number) {
		while (this._buffer.size() <= i && this.hasMore()) {
			this.addToken()
		}
		return i < this._buffer.size()
	}

	private addToken() {
		let token = this.createToken()
		if (token != undefined) {
			this._buffer.enqueue(token)
		}
	}
	/**
	 * 指示是否已到达输入末尾
	 */
	protected abstract hasMore(): boolean
	/**
	 * 当hasMore()返回false时调用
	 */
	protected abstract getEOF(): T
	/**
	 * 每当消费token时调用
	 */
	protected abstract createToken(): T | undefined

}

export const STRING = new TokenPro("STRING")
export const NUMBER = new TokenPro("NUMBER")
export const BOOLEAN = new TokenPro("BOOLEAN")
export const NULL = new TokenPro("NULL")

export class RegexpLexer extends AbstractLexer<Token> implements ILexer {

	private reservedWords = new Map<string, Token>()
	private line: number = 1
	private col: number = 0

	private text: string;
	private lastIndex = 0;
	private _hasMore = true

	private patterns = [
		{ regexp: /\s+/y, type: Tag.BLANK },
		{ regexp: /\/\/[^\n]*/y, type: Tag.COMMENT },
		{ regexp: /[/][*]{1,2}(?<content>(.|\s)+?)[*][/]/y, type: Tag.COMMENT },
		{ regexp: /[A-Z_a-z]\w*/y, type: Tag.WORD },
		{ regexp: /([1-9]\d*\.\d+)|(0\.\d+)/y, type: Tag.REAL },
		{ regexp: /(0(?![0-9]))|([1-9]\d*(?!\.))/y, type: Tag.NUM },
		{ regexp: /"(?<literal>(\\"|\\\\|\\n|\\t|[^"])*)"/y, type: Tag.STRING },
		{ regexp: /./y, type: Tag.SINGLE },
	]

	constructor(text: string) {
		super()
		this.text = text
		this.reserve(new Token({ lexeme: "true", lexval: true, tag: Tag.BOOL, proto: BOOLEAN }))
		this.reserve(new Token({ lexeme: "false", lexval: false, tag: Tag.BOOL, proto: BOOLEAN }))
		this.reserve(new Token({ lexeme: "null", lexval: null, tag: Tag.NULL, proto: NULL }))
	}

	private reserve(reserve: Token) {
		this.reservedWords.set(reserve.lexeme, reserve)
	}

	protected hasMore(): boolean {
		return this._hasMore
	}
	protected getEOF(): Token {
		return new Token({ tag: Tag.EOF, lexeme: "", lexval: "", proto: EOF, lineBegin: this.line, colBegin: this.col })
	}

	protected createToken(): Token | undefined {

		//分析
		let type: Tag | undefined, matchResult: RegExpExecArray | undefined
		for (let { regexp, type: t } of this.patterns) {
			regexp.lastIndex = this.lastIndex
			let r = regexp.exec(this.text)
			if (r != null) {
				matchResult = r
				type = t
				this.lastIndex = regexp.lastIndex
				break
			}
		}
		this._hasMore = this.lastIndex < this.text.length

		if (type == undefined || matchResult == undefined)
			this.onMatchFailed()

		//生成
		let lexeme = matchResult[0], token: Token | undefined
		switch (type) {
			case Tag.BLANK:
				break
			case Tag.STRING:
				{
					let literal = matchResult.groups!["literal"]
					literal = literal.replace(/\\["]/g, "\"") //还原转义符
					token = new Token({ lexeme: literal, lexval: literal, tag: Tag.STRING, proto: STRING })
				}
				break
			case Tag.SINGLE:
				token = new Token({ lexeme, lexval: lexeme, tag: Tag.SINGLE })
				break
			case Tag.WORD:
				if (this.reservedWords.has(lexeme)) {
					token = Object.assign(new Token({ lexeme, tag: Tag.WORD, lexval: lexeme }), this.reservedWords.get(lexeme)!)
				} else {
					throw new Error("Unknown token:" + lexeme +` at ${this.line},${this.col}`)
				}
				break
			case Tag.REAL: case Tag.NUM:
				token = new Token({ lexeme, lexval: parseFloat(lexeme), tag: Tag.NUM, proto: NUMBER })
				break
			case Tag.COMMENT: case Tag.MULTI_COMMENT:
				break
			default:
				throw new Error("Unknown tag:" + type+` at ${this.line},${this.col}`)
		}
		//行列计数
		let lineBegin = this.line, colBegin = this.col
		for (let chr of lexeme) {
			if (chr == "\n") {
				++this.line
				this.col = 0
			} else {
				++this.col
			}
		}
		let lineEnd = this.line, colEnd = this.col
		if (token != undefined) {
			token.setLocation(lineBegin, colBegin, lineEnd, colEnd)
		}
		return token
	}

	protected onMatchFailed(): never {
		throw new Error(`Unrecognized charactor(${this.line}):${this.text[this.col]} `)
	}
}
