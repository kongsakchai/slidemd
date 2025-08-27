import { existsSync, readdirSync } from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

const contentsPath = path.resolve(process.env.SLIDEMD_PATH || 'src/examples')
const themesPath = path.resolve(process.env.SLIDEMD_PATH || 'src/examples', 'themes')
const componentPath = path.resolve(process.env.SLIDEMD_PATH || 'src/examples', 'components')

const filterMD = (str: string) => {
	return /^[^.].*\.md$/.test(str) && /\/\./.test(str) === false
}

const getMarkdownList = (contentsPath: string) => {
	return readdirSync(contentsPath, { recursive: true, encoding: 'utf-8' }).filter(filterMD).sort()
}

const addSourcePathToCode = (code: string, sourcePath: string) => {
	return code.replace(/\/\* @source-path \*\//g, `@source '${sourcePath}';`)
}

const addThemesPatternToCode = (code: string, id: string, themesPath: string) => {
	const relative = path.relative(path.dirname(id), themesPath)
	return code.replace(/\/\* @themes-pattern \*\//g, `${relative}/*.css`)
}

const addCustomElementPatternToCode = (code: string, id: string, componentsPath: string) => {
	const relative = path.relative(path.dirname(id), componentsPath)
	return code.replace(/\/\* @custom-element-pattern \*\//g, `${relative}/*.svelte`)
}

export const slideMD = (): Plugin => {
	return {
		name: 'slideMD',
		enforce: 'pre',
		config() {
			process.env.SLIDEMD_LIST = getMarkdownList(contentsPath).join(',')
		},
		transform(code, id) {
			if (id.endsWith('app.css')) {
				return {
					code: addSourcePathToCode(code, contentsPath),
					map: null
				}
			}

			if (id.endsWith('slidemd.ts')) {
				if (existsSync(themesPath)) {
					code = addThemesPatternToCode(code, id, themesPath)
				}
				if (existsSync(componentPath)) {
					code = addCustomElementPatternToCode(code, id, componentPath)
				}

				return {
					code: code,
					map: null
				}
			}
		}
	}
}
