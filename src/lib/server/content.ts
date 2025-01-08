import { read } from '$app/server';
import { extractFrontmatter } from '$lib/slide';
import type { Contents } from '$lib/types';

const markdowns = import.meta.glob<string>('/contents/**/*.md', {
	query: '?url',
	eager: true,
	import: 'default'
});

const createContents = async (markdowns: Record<string, string>, base: string) => {
	const contents: Contents[] = [];
	for (const key in markdowns) {
		const file = key.replace(base, '');
		const text = await read(markdowns[key].split('?')[0]).text();
		const { body, metadata } = extractFrontmatter(text);
		contents.push({ file: file, metadata: metadata, body });
	}
	return contents;
};

export const contents = await createContents(markdowns, '/contents/');
