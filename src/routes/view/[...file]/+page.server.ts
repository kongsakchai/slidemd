import { read } from '$app/server'
import { env } from '$env/dynamic/private'
import slide from '$lib/slide'
import path from 'path'

const target = env.SLIDEMD_CONTENT_PATH || ''

export const load = async ({ params }) => {
	const a = path.resolve('/', target, params.file)
	const resp = read('/' + a)

	const markdown = await resp.text()

	return {
		slide: await slide.process(markdown)
	}
}
