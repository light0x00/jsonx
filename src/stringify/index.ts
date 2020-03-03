import { Class, isPrimitive, isString, Gragh } from "../common"
import { isNullOrUndefined } from "util"

export type PropertyConvertStrategy = {
	test(clazz: string): boolean,
	serialize(property: string, obj: Object): string
}
export type ClassConvertStrategy = {
	test(clazz: Class): boolean
	serialize(clazz: Class, obj: Object): string
}

/**
 * object -> string
 */
export class Stringify {

	protected propertyStrategy?: PropertyConvertStrategy
	protected classStrategy?: ClassConvertStrategy

	constructor(propertyStrategy?: PropertyConvertStrategy, classStrategy?: ClassConvertStrategy) {
		this.propertyStrategy = propertyStrategy
		this.classStrategy = classStrategy
	}

	protected beforeHandleClass(obj: Object): Object {
		let clazz = obj.constructor
		if (this.classStrategy?.test(clazz))
			return this.classStrategy.serialize(clazz, obj)
		return obj
	}

	protected beforeHandleProperty(key: string, obj: Object): Object {
		if (this.propertyStrategy?.test(key))
			return this.propertyStrategy.serialize(key, obj)
		return obj
	}

	apply(obj: Object) {
		return this.traverse(obj, new Gragh<any>())
	}

	private traverse(node: Object, G: Gragh<any>): string {
		//null
		if (isNullOrUndefined(node)) {
			return "null"
		}

		let result = ""
		node = this.beforeHandleClass(node) //apply class convert strategy

		//primitive	
		if (isPrimitive(node)) {
			return isString(node) ? `"${node}"` : node.toString()
		}
		//array
		else if (Array.isArray(node)) {
			result += "["
			for (let item of node) {

				this.ensureNoCycularReferences(node, item, G) // check cycle

				result += this.traverse(item, G) + ","
			}
			result = result.replace(/,$/, "")
			result += "]"
		}
		//object
		else {
			result += `{`
			for (let entry of Object.entries(node)) {
				let [propName, propVal] = entry

				// apply key convert strantegy
				propVal = this.beforeHandleProperty(propName, propVal)

				// check cycle
				this.ensureNoCycularReferences(node, propVal, G)

				result += `"${propName}":${this.traverse(propVal, G)},`
			}
			result = result.replace(/,$/, "")
			result += `}`
		}
		return result
	}
	
	private ensureNoCycularReferences(from: any, to: any, G: Gragh<any>) {
		if (isNullOrUndefined(from) || isNullOrUndefined(to) || isPrimitive(from) || isPrimitive(to))
			return
		G.addEdges(from, to)
		let cycle = G.path(to, from)
		if (cycle.length > 0) {
			cycle.push(to)
			throw new Error(`cycular references detected:\n${cycle.join("->")}`)
		}
	}
}

export type Converter = (obj: any) => any
export type StringifyOptions = {
	readonly classConverters?: Map<Class, Converter>,
	readonly propertyConverters?: Map<string, Converter>
}

/**
 * 默认启用的类转换器
 */
const DEFAULT_CONVERTERS = new Map<Class, Converter>()
DEFAULT_CONVERTERS.set(Date, (obj) => (obj as Date).toISOString())

export function createStringify(options?: StringifyOptions) {
	//determine stringify class convert strategy
	let classConverters = options?.classConverters ?? new Map<Class, Converter>()
	for (let [clz, cvt] of DEFAULT_CONVERTERS) {
		if (!classConverters.has(clz)) {
			classConverters.set(clz, cvt)
		}
	}
	let classStrategy: ClassConvertStrategy = {
		test(clazz: Class) {
			return classConverters!.has(clazz)
		},
		serialize(clazz: Class, obj: Object) {
			return classConverters!.get(clazz)!(obj)
		}
	}
	//determine key convert strategy
	let propertyStrategy: PropertyConvertStrategy | undefined
	if (options?.propertyConverters) {
		propertyStrategy = {
			test(prop: string) {
				return options.propertyConverters!.has(prop)
			},
			serialize(prop: string, obj: Object) {
				return options.propertyConverters!.get(prop)!(obj)
			}
		}
	}
	return new Stringify(propertyStrategy, classStrategy)
}