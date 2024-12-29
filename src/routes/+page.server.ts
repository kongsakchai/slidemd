import { createSlideRenderer } from '$lib/slide';
import fs from 'fs';

export const load = async () => {
	const slideRenderer = await createSlideRenderer();
	const file = fs.readFileSync('assets/markdown.md');
	const slide = slideRenderer.render(file.toString());
	return {
		...slide
	};
};
