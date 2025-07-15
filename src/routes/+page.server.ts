import { markdownToSlide } from '$lib/markdown'

export const prerender = true

export const load = async () => {
	const content = await import('../contents/example.md?raw')
	return {
		slide: await markdownToSlide(content.default)
	}
}
