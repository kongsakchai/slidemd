import { isAbsolute, join } from 'path';

export const resolveAssetUrl = (src: string, base?: string): string => {
	const absolute = isAbsolute(src);
	const path = base && !absolute ? join(base, src) : src;
	try {
		new URL(src);
		return src;
	} catch {
		return `/assets/${btoa(path)}`;
	}
};

export const joinAttrs = (attrs: [string, string][] | null) => {
	if (!attrs || attrs.length == 0) {
		return '';
	}
	return attrs
		.filter(([, value]) => value)
		.map(([key, value]) => `${key}="${value}"`)
		.join(' ');
};

export const extractFrontmatter = (markdown: string) => {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) {
		return { body: markdown, metadata: {} };
	}
	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);
	const metadata = frontmatter.split('\n').reduce((acc, line) => {
		const [key, value] = line.split(':').map((x) => x.trim());
		return { ...acc, [key]: value };
	}, {});

	return { body, metadata };
};
