import { loadDirectory } from '$lib/server/directory';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	if (params.directory.endsWith('.md')) {
		redirect(301, `/slide/${params.directory}`);
	}
	const list = loadDirectory(params.directory);

	return {
		path: params.directory,
		list
	};
};
