import { createContentList } from '$lib/content'
import { markdowns } from '@slidemd/slides'

export const ssr = false

export const load = async () => {
	return { contentList: createContentList(markdowns) }
}
