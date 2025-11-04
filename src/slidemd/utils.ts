import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

import { BUILTIN_PATH, CACHE_PATH, SLIDE_PATH } from './env'
import type { Markdown } from './types'

export const resolveBuiltin = (src: string) => {
	return path.join(BUILTIN_PATH, src)
}

export const resolveAsset = (src: string) => {
	return path.join(SLIDE_PATH, src)
}

export const relativeAsset = (src: string) => {
	return path.relative(SLIDE_PATH, src)
}

export const readMarkdown = (src: string): Markdown => {
	const raw = readFileSync(resolveAsset(src), { encoding: 'utf-8' })
	return {
		filepath: src,
		raw
	}
}

export const writeToCache = (filepath: string, content: string) => {
	const writepath = path.join(CACHE_PATH, filepath)
	mkdirSync(path.dirname(writepath), { recursive: true })
	writeFileSync(writepath, content)
}

export const markdownFilter = (d: string) => /\.md$/.test(d) && !/^\.|\/\./.test(d)

export const cssFilter = (d: string) => /\.css$/.test(d) && !/^\.|\/\./.test(d) && /^themes\//.test(d)
