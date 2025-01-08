import { contents } from '$lib/server/content.js';
import { slideRenderer } from '$lib/slide/renderer.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const content = contents.find((c) => c.file === params.file);
	if (!content) {
		error(404, 'Not found');
	}

	const slide = slideRenderer.render(content.body);
	return { metadata: content.metadata, slide, count: slide.length };
};
