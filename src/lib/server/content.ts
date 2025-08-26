import { env } from '$env/dynamic/private'
import type { Folder } from '$lib/types'
import { getMarkdownList } from './file'

const contentPath = env.SLIDEMD_PATH || 'src/examples'

export const createContentList = (files: string[]) => {
	const root: Folder = {
		folders: {},
		files: [],
		path: ''
	}

	files.forEach((item) => {
		const pathSplit = item.split('/')

		if (pathSplit.length === 1) {
			root.files.push({
				name: pathSplit[0],
				path: '/view/' + item
			})
			return
		}

		let parent = root
		pathSplit.forEach((p, i) => {
			if (!p) {
				parent.path = '/'
				return
			}

			if (i === pathSplit.length - 1) {
				parent.files.push({
					name: p,
					path: '/view/' + item
				})
				return
			}

			if (!parent.folders[p]) {
				parent.folders[p] = {
					folders: {},
					files: [],
					path: `${parent.path}/${p}`.replace('//', '/')
				}
			}

			parent = parent.folders[p]
		})
	})

	return root
}

export const contentList = createContentList(getMarkdownList(contentPath))
