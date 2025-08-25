import { env } from '$env/dynamic/private'
import type { Folder } from '$lib/types'

const loadExample = () => {
	const examples = import.meta.glob('../../examples/**/*.md', {
		query: '?url',
		eager: true,
		import: 'default'
	}) as Record<string, string>

	return Object.values(examples).map((v) => v.replace('/src/examples', ''))
}

const isExample = !env.SLIDEMD_MARKDOWN_LIST
const markdownList = !isExample ? (JSON.parse(env.SLIDEMD_MARKDOWN_LIST || '[]') as string[]) : loadExample()

export const createContentList = (fileList: string[]) => {
	console.log(fileList)
	const root: Folder = {
		folders: {},
		files: []
	}

	fileList.forEach((item) => {
		const pathSplit = item.split('/')

		if (pathSplit.length === 1) {
			root.files.push({
				name: pathSplit[0],
				path: item
			})
			return
		}

		let tempRoot = root
		pathSplit.forEach((p) => {
			if (!p) return

			if (p.endsWith('.md')) {
				tempRoot.files.push({
					name: p,
					path: item
				})
				return
			}

			if (!tempRoot.folders[p]) {
				tempRoot.folders[p] = {
					folders: {},
					files: []
				}
			}

			tempRoot = tempRoot.folders[p]
		})
	})

	return root
}

export const contentList = createContentList(markdownList)
