import { getDirectoryItem, validatePath } from '$lib/server/file';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const path = validatePath(params.dir);
	if (path === null) {
		error(404, 'Not found');
	}

	const detals = getDirectoryItem(path);
	return {
		detals,
		path
	};
};
