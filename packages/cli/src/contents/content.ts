import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'

const HIDDEN_FILE_REGEX = /^\.|\/\./g

export const isHiddenFile = (src: string) => HIDDEN_FILE_REGEX.test(src)

export const isMarkdown = (src: string) => path.extname(src) === '.md'

export const findMarkdowns = (src: string) => {
	const assets = readdirSync(src, { recursive: true, encoding: 'utf-8' })
	return assets.filter((p) => isMarkdown(p) && !isHiddenFile(p))
}

export const readMarkdown = (src: string) => {
	if (!existsSync(src) || !src.endsWith('.md')) return undefined
	return readFileSync(src, { encoding: 'utf-8' })
}
