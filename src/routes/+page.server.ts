import { slideRenderer } from '$lib/slide';
import fs from 'fs';

export const load = async () => {
	const file = fs.readFileSync('src/assets/markdown.md');
	const slide = slideRenderer.render(file.toString());
	return {
		...slide
	};
};
