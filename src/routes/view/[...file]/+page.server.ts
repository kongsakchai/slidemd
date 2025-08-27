import { env } from '$env/dynamic/private'
import slide from '$lib/slide'
import { readFileSync } from 'fs'
import path from 'path'

const contentsPath = env.SLIDEMD_PATH || 'src/examples'

export const trailingSlash = 'always'

export const load = async ({ params }) => {
	let filePath = path.join(contentsPath, params.file)
	if (filePath.endsWith('/')) {
		filePath = filePath.slice(0, filePath.length - 1)
	}

	const resp = readFileSync(filePath, { encoding: 'utf-8' })
	return {
		slide: await slide.process(resp)
	}
}
