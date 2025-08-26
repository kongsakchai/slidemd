import { createContentList } from '$lib/server/content'

const contentList = createContentList(process.env.SLIDEMD_PATH || 'src/examples')

export const ssr = false
export const prerender = true

export const load = async () => {
	return { contentList }
}
