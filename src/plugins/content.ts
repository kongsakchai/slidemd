import { readdirSync } from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

const filterMD = (str: string) => {
	return /^[^.].*\.md$/.test(str) && /\/\./.test(str) === false
}

const getMarkdownList = (contentPath: string) => {
	const absolutePath = path.resolve(contentPath)
	const markdowns = readdirSync(absolutePath, { recursive: true, encoding: 'utf-8' }).filter(filterMD).sort()

	return markdowns
}

export const loadContents = (): Plugin => {
	return {
		name: 'load-contents',
		config() {
			console.log('🌱 Loading content list')
			process.env.SLIDEMD_LIST = getMarkdownList(process.env.SLIDEMD_PATH || 'src/examples').join(',')
		}
	}
}
