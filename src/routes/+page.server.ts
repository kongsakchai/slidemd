import { markdownToHtml } from '$lib/markdown'

export const load = async () => {
	const content = await import('../contents/example.md?raw')
	return {
		body: await markdownToHtml(content.default)
	}
}
