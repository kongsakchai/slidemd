import { contents } from '$lib/server/content.js';
import { slideRenderer } from '$lib/slide/renderer.js';
import { error } from '@sveltejs/kit';
import { dirname } from 'path';

export const load = async ({ params }) => {
	const content = contents.find((c) => c.file === params.file);
	if (!content) {
		error(404, 'Not found');
	}

	const base = dirname(params.file);

	const slide = slideRenderer.render(content.body, base);
	return { metadata: content.metadata, slide, total: slide.length };
};
