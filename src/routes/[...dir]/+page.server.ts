import { getSubPathDetails, validatePath } from '$lib/service/file';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const path = validatePath(params.dir);
	if (path === null) {
		error(404, 'Not found');
	}

	console.log('path', path);

	const detals = getSubPathDetails(path);
	return {
		detals,
		path
	};
};
