import { createContentList } from '$lib/content'

export const ssr = false

const markdowns = process.env.SLIDEMD_LIST?.split(',') || []

export const load = async () => {
	return { contentList: createContentList(markdowns) }
}
