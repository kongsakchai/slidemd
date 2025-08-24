import { env } from '$env/dynamic/private'

const markdownList = JSON.parse(env.SLIDEMD_MARKDOWN_LIST || '[]')

export interface Folder {
	folders: Record<string, Folder>
	files: string[]
}

export const createContentList = (fileList: string[]) => {
	const root: Folder = {
		folders: {},
		files: []
	}

	fileList.forEach((item) => {
		const pathSplit = item.split('/')

		if (pathSplit.length === 1) {
			root.files.push(pathSplit[0])
			return
		}

		let tempRoot = root
		pathSplit.forEach((p, i) => {
			if (i === pathSplit.length - 1) {
				tempRoot.files.push(p)
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
