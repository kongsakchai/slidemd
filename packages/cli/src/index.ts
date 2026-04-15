// const VIRTUAL_ENTRY_ID = 'virtual:slidemd'

import path from 'path'
import { createServer } from './command/serve'

// const devMiddleware = (): Plugin => {
// 	const indexHtml = readFileSync(config.template.indexTemplate, { encoding: 'utf-8' })

// 	return {
// 		name: 'slidemd-dev',
// 		resolveId(id) {
// 			if (id === '@slidemd') {
// 				return '@slidemd.svelte'
// 			}
// 		},
// 		load(id) {
// 			if (id === '@slidemd.svelte') {
// 				return '<h1>Hello</h1>'
// 			}
// 		},
// 		configureServer(server) {
// 			server.middlewares.use(async (req, res, next) => {
// 				const url = req.url ?? '/'
// 				if (url !== '/' && url !== '/index.html') {
// 					console.log('url' + url)
// 					return next()
// 				}

// 				const transformed = await server.transformIndexHtml(url, indexHtml)
// 				res.statusCode = 200
// 				res.setHeader('Content-Type', 'text/html; charset=utf-8')
// 				res.end(transformed)
// 			})
// 		}
// 	}
// }

// const createViteConfig = () => {
// 	return defineConfig({
// 		plugins: [devMiddleware(), svelte()]
// 	})
// }

// const args = process.argv.slice(2)
// const sourceDir = args[0]

// async function createDevServer() {
// 	const viteConfig = createViteConfig()

// 	const serv = await createServer(viteConfig)
// 	await serv.listen()
// 	serv.printUrls()

// 	return {
// 		close: async () => {
// 			await serv.close()
// 		}
// 	}
// }

const args = process.argv.slice(2)

const run = async () => {
	const src = path.resolve(args[0])

	const server = await createServer(src)
	await server.listen()

	const resolvedPort = server.config.server.port
	const url = `http://localhost:${resolvedPort}`
	console.log(url)

	async function shutdown() {
		console.log('shutdown bye bye')
		await server.close()
	}
	process.once('SIGINT', () => shutdown())
	process.once('SIGTERM', () => shutdown())
}

run()
