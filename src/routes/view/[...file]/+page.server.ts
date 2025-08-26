import { env } from '$env/dynamic/private'
import slide from '$lib/slide'
import { readFileSync } from 'fs'
import path from 'path'

const contentPath = env.SLIDEMD_PATH || 'src/examples'

export const prerender = true
export const trailingSlash = 'always'

export const load = async ({ params }) => {
	let filePath = path.join(contentPath, params.file)
	if (filePath.endsWith('/')) {
		filePath = filePath.slice(0, -1)
	}

	const resp = readFileSync(filePath + '.md', { encoding: 'utf-8' })
	return {
		slide: await slide.process(resp)
	}
}
