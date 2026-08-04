// import { resolveRoot } from '@/content'
// import { createSlidemdPlugin } from '@/plugin'
// import { resolve } from '@/utils'

// import { slidemd } from '@slidemd/slidemd'
// import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
// import tailwindcss from '@tailwindcss/vite'

// import { mkdir, writeFile } from 'node:fs/promises'
// import path from 'node:path'
// import type { InlineConfig, Plugin } from 'vite'
// import { build as viteBuild } from 'vite'

// export interface BuildOptions {
// 	out?: string
// }

// interface Entry {
// 	name: string
// 	module: string
// }

// /** A virtual module per route that mounts the page component into `#app`. */
// function entryPlugin(entries: Entry[]): Plugin {
// 	const sources = new Map<string, string>()
// 	for (const entry of entries) {
// 		const id = `slidemd:entry:${entry.name}`
// 		sources.set(
// 			id,
// 			[
// 				`import { mount } from 'svelte'`,
// 				`import 'slidemd:app.css'`,
// 				`import App from '${entry.module}'`,
// 				`const el = document.getElementById('app')`,
// 				`if (el) mount(App, { target: el })`
// 			].join('\n')
// 		)
// 	}

// 	return {
// 		name: 'slidemd:entry',
// 		resolveId(id) {
// 			if (sources.has(id)) return id
// 		},
// 		load(id) {
// 			if (sources.has(id)) return sources.get(id)
// 		}
// 	}
// }

// function renderEntryHTML(script: string): string {
// 	return [
// 		`<!doctype html>`,
// 		`<html lang="en">`,
// 		`<head>`,
// 		`<meta charset="UTF-8" />`,
// 		`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
// 		`<title>slidemd</title>`,
// 		`</head>`,
// 		`<body>`,
// 		`<div id="app"></div>`,
// 		`<script type="module" src="${script}"></script>`,
// 		`</body>`,
// 		`</html>`
// 	].join('\n')
// }

// export async function build(root: string, options: BuildOptions = {}): Promise<void> {
// 	const src = resolveRoot(root)
// 	const outDir = path.resolve(options.out ?? 'dist')
// 	const plugin = createSlidemdPlugin(src, { watch: false })

// 	const entries: Entry[] = []
// 	for (const [route, moduleId] of plugin.routes) {
// 		const name = route === '' ? 'index' : resolve(route)
// 		entries.push({ name, module: moduleId })
// 	}

// 	const input = Object.fromEntries(entries.map((e) => [e.name, `slidemd:entry:${e.name}`]))

// 	const inlineConfig: InlineConfig = {
// 		configFile: false,
// 		plugins: [
// 			plugin,
// 			entryPlugin(entries),
// 			tailwindcss(),
// 			svelte({
// 				extensions: ['.svelte', '.md'],
// 				preprocess: [slidemd({ extension: '.md' }), vitePreprocess()]
// 			})
// 		],
// 		build: {
// 			outDir,
// 			emptyOutDir: true,
// 			rollupOptions: { input }
// 		},
// 		logLevel: 'warn'
// 	}

// 	const result = (await viteBuild(inlineConfig)) as unknown as
// 		| { output: Array<{ type: string; name?: string; fileName: string; isEntry?: boolean }> }
// 		| Array<{ output: Array<{ type: string; name?: string; fileName: string; isEntry?: boolean }> }>
// 	const outputs = Array.isArray(result) ? result.flatMap((r) => r.output) : result.output

// 	await mkdir(outDir, { recursive: true })
// 	for (const entry of entries) {
// 		const chunk = outputs.find((o) => o.type === 'chunk' && o.isEntry && o.name === entry.name)
// 		if (!chunk) {
// 			throw new Error(`Build did not produce an entry chunk for "${entry.name}"`)
// 		}
// 		await writeFile(path.join(outDir, `${entry.name}.html`), renderEntryHTML(`/${chunk.fileName}`), 'utf-8')
// 	}

// 	console.log(`built ${entries.length} slide(s) → ${outDir}`)
// }
