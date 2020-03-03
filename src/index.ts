
import { Class } from "./common"
import {  createStringify, Stringify, Converter } from "./stringify"
import { createParse } from "./parse"

export type JSONXOptions = {
	readonly classConverters? : Map<Class, Converter>,
	readonly propertyConverters?: Map<string, Converter>
}

export class JSONXBuilder {
	private jsonxOptions: JSONXOptions = {
		propertyConverters: new Map<string, Converter>(),
		classConverters: new Map<Class, Converter>()
	}
	addPropertyConverter(property: string, converter: Converter) {
		this.jsonxOptions.propertyConverters!.set(property, converter)
		return this
	}
	addClassConverter(clazz: Class, converter: Converter) {
		this.jsonxOptions.classConverters!.set(clazz, converter)
		return this
	}
	build(): JSONX {
		return new JSONX(this.jsonxOptions)
	}
}

export default class JSONX {

	/* static */
	static defaultStringify = createStringify()
	static defaultParse = createParse()
	static stringify(obj: any) {
		return JSONX.defaultStringify.apply(obj)
	}
	static parse(str: string): Object {
		return this.defaultParse.apply(str)
	}

	/* instance */
	stringifyInstance: Stringify
	constructor(options: JSONXOptions) {
		this.stringifyInstance = createStringify(options)
	}
	stringify(obj: Object): string {
		return this.stringifyInstance.apply(obj)
	}
	parse(str: string): Object {
		return JSONX.defaultParse.apply(str)
	}
	
}

