import MarkdownIt from 'markdown-it';

export const createMarkdown = () => {
	const md = new MarkdownIt({ html: true });

	return (markdown: string) => md.render(markdown);
};
