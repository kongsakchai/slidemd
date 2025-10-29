/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Parent, Root } from 'mdast'
import { VFile } from 'vfile'
import type { Attribuites } from './types'

export class Context {
	data: Attribuites

	constructor(init: Attribuites = {}) {
		this.data = init
	}

	get directive() {
		this.data.directive ??= {}
		return this.data.directive as Attribuites
	}

	set directive(value: Attribuites) {
		this.data.directive = value
	}
}

export class RootContext extends Context {
	vfile: VFile
	root: Root

	constructor(root: Root, vfile: VFile) {
		super()
		this.root = root
		this.vfile = vfile
		this.data.page = (vfile.data.page || 0) as number
	}

	get parents() {
		if (this.data.split) return this.root.children as Parent[]
		return [this.root]
	}

	get children() {
		return this.root.children
	}

	subChildren(start: number, end?: number) {
		return this.root.children.slice(start, end)
	}
}
