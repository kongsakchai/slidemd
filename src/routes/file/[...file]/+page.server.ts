import { getFile, validatePath } from '$lib/server/file';
import { createSlideRenderer } from '$lib/service/slide/renderer.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const path = validatePath(params.file);
	if (path === null) {
		error(404, 'Not found');
	}

	const slideRenderer = await createSlideRenderer();
	const slide = slideRenderer.render(getFile(path));

	return { ...slide, count: slide.pages.length };
};
