import slide from '$lib/slide'

export const prerender = true

export const load = async () => {
	const content = await import('../contents/example.md?raw')
	return {
		slide: await slide.process(content.default)
	}
}
