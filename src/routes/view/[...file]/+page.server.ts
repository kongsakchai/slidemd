import { env } from '$env/dynamic/private'
import slide from '$lib/slide'
import { readFileSync } from 'fs'
import path from 'path'

const contentPath = env.SLIDEMD_PATH || 'src/examples'

export const prerender = true
export const trailingSlash = 'always'

export const load = async ({ params }) => {
	const filePath = path.join(contentPath, params.file.slice(0, params.file.length - 1) + '.md')
	const resp = readFileSync(filePath, { encoding: 'utf-8' })

	const markdown = resp
	return {
		slide: await slide.process(markdown)
	}
}
