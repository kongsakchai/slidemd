import { loadDirectory } from '$lib/server/directory';

export const load = async ({ params }) => {
	const list = loadDirectory(params.directory);

	return {
		path: params.directory,
		list
	};
};
