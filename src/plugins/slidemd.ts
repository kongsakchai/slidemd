import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Plugin } from 'vite'
import { directiveToStyle } from '../lib/helper/styles'
import slidemd from '../lib/slidemd'
import type { Slide } from '../lib/slidemd/types'

const sourcePath = path.resolve(process.env.SLIDEMD_PATH || 'src/examples')
const themesPath = path.resolve(process.env.SLIDEMD_PATH || 'src/examples', 'themes')

const themePlaceholder = '/* #external-theme */'

const slideToComponets = (slide: Slide) => {
	const pages = slide.pages.map((page, i) => {
		const html = page.html || ''
		delete page.html

		return `
				<section 
					data-page="${i + 1}" 
					class="slide ${page.directive?.class || ''}" 
					class:split={${page.split?.split || false}}
					class:hidden={currentPage !== ${i + 1}}
					style:--split-size="${page.split?.size}"
					style="${directiveToStyle(page.directive, page.split?.split)}"
				>${html}</section>
			`
	})

	return `
		<script lang="ts" module>
			export const slideData = ${JSON.stringify(slide)}
		</script>

		<script lang="ts">
			let { currentPage } = $props()
		</script>

		${pages.join('\n')}
	`
}

const loadMarkdown = () => {
	return readdirSync(sourcePath, {
		recursive: true,
		encoding: 'utf-8'
	}).filter((src) => {
		// ✅ check is markdown and don't hidden
		return /^[^.].*\.md$/.test(src) && /\/\./.test(src) === false
	})
}

const loadModule = (markdownList: string[]) => {
	const modules: Record<string, string> = {}
	markdownList.forEach((src, i) => {
		modules[`\0virtual:slidemd-${i}.svelte`] = src
	})
	return modules
}

export const slideMD = async (): Promise<Plugin> => {
	const virtualModuleId = 'virtual:slidemd'
	const resolvedVirtualModuleId = `\0${virtualModuleId}.ts`

	let markdownList: string[] = []
	let modules: Record<string, string> = {}

	const reload = () => {
		markdownList = loadMarkdown()
		modules = loadModule(markdownList)

		process.env.SLIDEMD_LIST = markdownList.join(',')
	}

	return {
		name: 'slideMD',
		enforce: 'pre',
		config() {
			reload()
		},
		// 🔥 Add hot module reload when markdown files change
		configureServer(server) {
			server.watcher.add(path.join(sourcePath, '**/*.md'))
			server.watcher.on('all', (event, path) => {
				if (path.endsWith('.md')) {
					reload()

					server.moduleGraph.invalidateAll()
					server.ws.send({ type: 'full-reload' })
				}
			})
		},
		resolveId(id) {
			// 🎉 add .ts to compile by typescript compile
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId
			}

			// 🎉 add .svelte to compile by svelte compile
			if (id.startsWith(`${virtualModuleId}-`)) {
				return `\0${id}.svelte`
			}
		},
		async load(id) {
			// 🌱 make main module
			if (id === resolvedVirtualModuleId) {
				const imports: string[] = []
				const returns: string[] = []
				markdownList.forEach((src, i) => {
					// 🌱 Example : import Slide_1 from 'virtual:slidemd-1'
					imports.push(`import Slide_${i}, {slideData as Data_${i}} from 'virtual:slidemd-${i}'`)
					// 🌱 Example : "src/example.md":Slide_1
					returns.push(`"${src}":{ component:Slide_${i}, data:Data_${i} }`)
				})

				return `
					${imports.join('\n')}

					const slide = {
						${returns.join(',')}
					}

					export default slide
				`
			}

			// 🌱 make slide components
			if (modules[id]) {
				const markdown = readFileSync(path.join(sourcePath, modules[id]), { encoding: 'utf-8' })
				const result = await slidemd.process(markdown)
				return slideToComponets(result)
			}
		},
		transform(code, id) {
			//🎉 add source path to app.css for tailwind css detected
			if (id.endsWith('slidemd.load.ts')) {
				if (existsSync(themesPath)) {
					const relative = path.relative(path.dirname(id), themesPath)
					return {
						code: code.replace(themePlaceholder, `${relative}/*.css`),
						map: null
					}
				}
				return {
					code: code,
					map: null
				}
			}
		}
	}
}
