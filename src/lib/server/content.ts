import type { Folder } from '$lib/types'
import { readdirSync } from 'fs'
import path from 'path'

export const getFileList = (contentPath: string) => {
	const filterMD = (str: string) => {
		return /^[^.].*.md$/.test(str) && /\/\./.test(str) === false
	}
	const removeMD = (str: string) => {
		return str.replace(/\.md$/, '')
	}

	const absolutePath = path.resolve(contentPath)
	const markdowns = readdirSync(absolutePath, { recursive: true, encoding: 'utf-8' }).filter(filterMD).map(removeMD)

	return markdowns
}

export const createContentList = (contentPath: string) => {
	const root: Folder = {
		folders: {},
		files: []
	}

	getFileList(contentPath).forEach((item) => {
		const pathSplit = item.split('/')

		if (pathSplit.length === 1) {
			root.files.push({
				name: pathSplit[0],
				path: item
			})
			return
		}

		let tempRoot = root
		pathSplit.forEach((p, i) => {
			if (!p) return

			if (i === pathSplit.length - 1) {
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

// export const contentList = createContentList(env.SLIDEMD_PATH || 'src/examples')
