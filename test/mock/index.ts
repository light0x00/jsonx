import fs from "fs"
import { resolve } from "path"
export const getMock = (path: string) => fs.readFileSync(resolve(__dirname, path), "utf8")

export class Member {
	name?: string
	group?: Group
	lover?: Member
	constructor(name: string) {
		this.name = name
	}
	toString() {
		return this.name!
	}
}
export class Group {
	members?: Member[]
	name?: string
	lover?: Member
	constructor(name: string) {
		this.name = name
	}
	toString() {
		return this.name!
	}
}