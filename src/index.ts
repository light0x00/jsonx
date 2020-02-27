
function isArray(obj: Object): obj is Array<any> {
	return obj.constructor.name === "Array"
}

function isPrimitive(obj: Object) {
	return obj !== Object(obj)
}

function isString(obj: Object): obj is string {
	return obj.constructor.name === "String"
}
// function isDate(obj: Object): obj is Date {
// 	return obj.constructor.name === "Date"
// }

type PropertyConvertStrategy = {
	test(clazz: string): boolean,
	serialize(property: string, obj: Object): string
}
type ClassConvertStrategy = {
	test(clazz: Class): boolean
	serialize(clazz: Class, obj: Object): string
}

/**
 * object -> string
 */
class Stringify {

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

	protected beforeHandleKey(key: string, obj: Object): Object {
		if (this.propertyStrategy?.test(key))
			return this.propertyStrategy.serialize(key, obj)
		return obj
	}

	apply(obj: Object) {
		return this.traverse(obj)
	}

	private traverse(node: Object): string {
		let str = ""
		// apply class convert strategy
		node = this.beforeHandleClass(node)
		//primitive	
		if (isPrimitive(node)) {
			return isString(node) ? `"${node}"` : node.toString()
		}
		//array
		else if (isArray(node)) {
			str += "["
			for (let c of node) {
				str += this.traverse(c) + ","
			}
			str = str.replace(/,$/, "")
			str += "]"
		}
		//object
		else {
			str += `{`
			for (let en of Object.entries(node)) {
				let [key, obj] = en
				// apply key convert strantegy
				obj = this.beforeHandleKey(key, obj)
				str += `"${key}":${this.traverse(obj)},`
			}
			str = str.replace(/,$/, "")
			str += `}`
		}
		return str
	}
}

export type Class = (new () => Object) | Function
export type Converter = (obj : any) => any
export type JSONXOptions = {
	readonly classConverters?: Map<Class, Converter>,
	readonly propertyConverters?: Map<string, Converter>
}

/**
 * 默认启用的类转换器
 */
const DEFAULT_CONVERTERS = new Map<Class, Converter>()
DEFAULT_CONVERTERS.set(Date, (obj) => (obj as Date).toISOString())

/**
 * 简单工厂
 */
class JSONXFactory {
	/**
	 * 
	 * @param options 
	 */
	static createStringify(options?: JSONXOptions) {
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
}

/**
 * JSONX 对象装配
 */
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
		this.jsonxOptions.classConverters?.set(clazz, converter)
		return this
	}
	build(): JSONX {
		return new JSONX(this.jsonxOptions)
	}
}

/**
 * 对外API
 */
export default class JSONX {
	/* static */
	static defaultStringify = JSONXFactory.createStringify()
	static stringify(obj: any) {
		return JSONX.defaultStringify.apply(obj)
	}
	static parse(str: string): Object {
		return {}
	}
	/* instance */
	stringifyInstance: Stringify
	constructor(options: JSONXOptions) {
		this.stringifyInstance = JSONXFactory.createStringify(options)
	}
	stringify(obj: Object) {
		return this.stringifyInstance.apply(obj)
	}
	parse(str: string) {

	}
}

