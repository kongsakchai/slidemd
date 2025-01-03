export const joinAttrs = (attrs: [string, string][]) => {
	if (!attrs.length) return '';
	const mapAttrs = ([key, value]: [string, string]) => {
		if (key === 'class') {
			return `${key}="code-container ${value}"`;
		}
		return `${key}="${value}"`;
	};

	return attrs.map(mapAttrs).join(' ');
};

export const splitStepCode = (code: string, lang: string, codeToHtml: (code: string, lang: string) => string) => {
	const steps = code.split('/* step */');
	const htmls = steps.map((step) => codeToHtml(step, lang));
	return htmls.join('');
};
