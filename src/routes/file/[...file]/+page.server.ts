import { createSlideRenderer } from '$lib/service/slide/renderer.js';
import { loadFile, validatePath } from '$lib/utils/file';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const path = validatePath(params.file);
	if (path === null) {
		error(404, 'Not found');
	}

	const slideRenderer = await createSlideRenderer();
	const slide = slideRenderer.render(loadFile(path));

	return { slide };
};
