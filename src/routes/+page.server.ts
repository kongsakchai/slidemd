import { render } from '$lib/slide';
import fs from 'fs';

export const load = async () => {
	const file = fs.readFileSync('src/assets/markdown.md');
	const html = render(file.toString());
	return {
		meta: '',
		pages: [html]
	};
};
