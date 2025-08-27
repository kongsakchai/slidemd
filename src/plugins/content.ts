import { readdirSync } from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

const contentPath = process.env.SLIDEMD_PATH || 'src/examples'

const filterMD = (str: string) => {
	return /^[^.].*\.md$/.test(str) && /\/\./.test(str) === false
}

const getMarkdownList = (contentPath: string) => {
	const absolutePath = path.resolve(contentPath)
	const markdowns = readdirSync(absolutePath, { recursive: true, encoding: 'utf-8' }).filter(filterMD).sort()

	return markdowns
}

const sourceCSSRegex = /\/\* <SOURCE_CONTENT> \*\//g

const createSourceCSS = (path: string) => {
	return `@source '${path}';`
}

export const loadContents = (): Plugin => {
	return {
		name: 'load-contents',
		enforce: 'pre',
		config() {
			console.log('🌱 Loading content list')
			process.env.SLIDEMD_LIST = getMarkdownList(contentPath).join(',')
		},
		transform(code, id) {
			if (id.endsWith('app.css')) {
				return {
					code: code.replace(sourceCSSRegex, createSourceCSS(contentPath)),
					map: null
				}
			}
		}
	}
}
