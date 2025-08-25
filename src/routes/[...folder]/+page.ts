import { error } from '@sveltejs/kit'

export const load = ({ params, data }) => {
	const pathSplit = params.folder?.split('/') || []

	let folder = data.contentList
	pathSplit.forEach((p) => {
		if (!p) return

		if (!folder.folders[p]) {
			throw error(404)
		}

		folder = folder.folders[p]
	})

	return { folder }
}
