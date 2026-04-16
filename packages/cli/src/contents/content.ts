import { existsSync, readFileSync, readdirSync } from 'fs'

export interface Directory {
	directory: Record<string, Directory>
	files: File[]
}

export interface File {
	name: string
	path: string
}

const markdownFilter = (d: string) => /\.md$/.test(d) && !/^\.|\/\./.test(d)

export const createContentTree = (files: string[]) => {
	const root: Directory = {
		directory: {},
		files: []
	}

	// files.forEach((file) => {
	// 	let parent = root
	// 	const pathSplit = file.split('/')
	// 	pathSplit.forEach((p, i) => {
	// 		if (!p) return

	// 		if (i === pathSplit.length - 1) {
	// 			parent.files.push({ name: p, path: file })
	// 			return
	// 		}

	// 		if (!parent.directory[p]) {
	// 			parent = parent.directory[p] = { directory: {}, files: [] }
	// 			return
	// 		}

	// 		parent = parent.directory[p]
	// 	})
	// })

	return root
}

export const getMarkdowns = (src: string) => {
	const assets = readdirSync(src, { recursive: true, encoding: 'utf-8' })
	const markdowns = assets.filter(markdownFilter)
	return { markdowns }
}

export const readMarkdown = (src: string) => {
	if (!existsSync(src) || !src.endsWith('.md')) return undefined
	return readFileSync(src, { encoding: 'utf-8' })
}
