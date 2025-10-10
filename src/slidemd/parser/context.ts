import type { Parent, Root } from 'mdast'
import { VFile } from 'vfile'
import type { Attribuites } from './types'

export class Context {
	page: number
	vfile: VFile

	root: Root
	directive: Attribuites = {}
	split: boolean = false

	constructor(root: Root, vfile: VFile) {
		this.page = (vfile.data.page || 0) as number
		this.vfile = vfile
		this.root = root
	}

	get parents() {
		if (this.split) return this.root.children as Parent[]
		return [this.root]
	}

	get children() {
		return this.root.children
	}

	subChildren(start: number, end?: number) {
		return this.root.children.slice(start, end)
	}
}
