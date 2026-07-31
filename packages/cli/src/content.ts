import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const HIDDEN_FILE_REGEX = /\/\.|^\./g

export const isHiddenFile = (src: string) => HIDDEN_FILE_REGEX.test(src)

export const findMarkdowns = (src: string): string[] => {
	const entries = readdirSync(src, { recursive: true, encoding: 'utf-8' })
	return entries.filter((p) => p.endsWith('.md') && !isHiddenFile(p))
}

export const readMarkdown = (src: string): string | undefined => {
	if (!existsSync(src) || !src.endsWith('.md')) return undefined
	return readFileSync(src, { encoding: 'utf-8' })
}

export const resolveRoot = (root: string): string => {
	const abs = path.resolve(root)
	if (!existsSync(abs) || !statSync(abs).isDirectory()) {
		throw new Error(`Content directory not found: ${abs}`)
	}
	return abs
}
