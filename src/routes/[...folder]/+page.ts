import type { Folder } from '$lib/types'

export const load = ({ params, data }) => {
	const pathSplit = params.folder?.split('/') || []

	let folder = data.contentList as Folder
	pathSplit.forEach((p) => {
		if (!p) return

		if (!folder.folders[p]) {
			// throw error(404)
			return
		}

		folder = folder.folders[p]
	})

	return { folder }
}
