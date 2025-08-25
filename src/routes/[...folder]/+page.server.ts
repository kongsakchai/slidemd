import { contentList } from '$lib/server/content'

export const ssr = false

export const load = async () => {
	return { contentList }
}
