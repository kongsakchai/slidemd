export const joinAttrs = (attrs: [string, string][]) => {
	if (!attrs.length || attrs.length == 0) {
		return '';
	}
	return attrs.map(([key, value]) => `${key}="${value}"`).join(' ');
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
