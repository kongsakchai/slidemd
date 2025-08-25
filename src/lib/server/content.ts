import { env } from '$env/dynamic/private'

const markdownList = JSON.parse(env.SLIDEMD_MARKDOWN_LIST || '[]')

export interface Folder {
	folders: Record<string, Folder>
	files: File[]
}

export interface File {
	name: string
	path: string
}

export const createContentList = (fileList: string[]) => {
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
