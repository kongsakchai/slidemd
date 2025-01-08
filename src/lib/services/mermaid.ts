import mermaid from 'mermaid';

export const initMermaid = async () => {
	mermaid.initialize({
		startOnLoad: false,
		fontSize: 12,
		fontFamily: 'Geist Mono, Sarabun'
	});

	await mermaid.run({ querySelector: '.mermaid' });
};
