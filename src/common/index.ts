import { Queue } from "@light0x00/shim"
import debug from "debug"

export const logger = debug("jsonx")

export type Class = (new () => Object) | Function

export function isPrimitive(value: Object) {
	return (typeof value !== "object" && typeof value !== "function") || value === null
}

export function isString(obj: Object): obj is string {
	return typeof obj === "string"
}

export class Gragh<T>{
	private G = new Map<T, Set<T>>()
	addEdges(from: T, to: T) {
		this.G.get(from) ?? this.G.set(from, new Set<T>())
		this.G.get(from)!.add(to)
	}
	reachable(from: T, to: T): boolean {
		return this.path(from, to).length > 0
	}
	/* 广度优先遍历 当寻找到第一个from到to的路径时返回路径中节点的集合 */
	path(from: T, to: T): T[] {
		let roots = this.G.get(from)
		/* 快速通道 */
		if (roots == undefined)
			return []
		else if (roots.has(to))
			return [from, to]

		let queue = new Queue<T>(from)
		let visited = new Set<T>([from])
		let track = new Map<T, T>() //记录足迹 当发现可达时 还原出路径

		while (queue.size() > 0) {
			let head = queue.dequeue()!
			let adjs = this.G.get(head)
			if (adjs == undefined)
				continue
			if (adjs.has(to)) {
				track.set(to, head)
				return this.restorePath(from, to, track)
			}
			for (let adj of adjs) {
				if (visited.has(adj))
					continue
				visited.add(adj)
				track.set(adj, head)
				queue.enqueue(adj)
			}
		}
		return []
	}

	cycle(vertex: T): T[] {
		return this.path(vertex, vertex)
	}
	/* 根据追踪信息 还原出end到start的路径节点集合 */
	private restorePath(start: T, end: T, track: Map<T, T>): T[] {
		let path = [end]
		let cur
		for (cur = track.get(end)!; cur != start; cur = track.get(cur)!) {
			path.unshift(cur)
		}
		path.unshift(start)
		return path
	}
}