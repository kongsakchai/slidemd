import type { PluginSimple } from 'markdown-it';
import { isAbsolute, join } from 'path';

export const imageRender: PluginSimple = (md) => {
	const originalImage = md.renderer.rules.image;
	md.renderer.rules.image = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		const contents = token.content.split(' ');
		const src = token.attrGet('src') || '';
		if (!src) {
			return '';
		}

		const style = extractImageStyle(contents);
		if (style) {
			token.attrSet('style', style);
		}
		token.attrSet('alt', contents[0] || '');
		token.attrSet('src', resolveImageSrc(src, env.base));

		return originalImage?.(tokens, idx, options, env, self) || self.renderToken(tokens, idx, options);
	};
};

const resolveImageSrc = (src: string, base?: string): string => {
	const absolute = isAbsolute(src);
	const path = base && !absolute ? join(base, src) : src;

	try {
		new URL(src);
		return src;
	} catch {
		return `/assets/${btoa(path)}`;
	}
};

const extractImageStyle = (contents: string[]): string => {
	let style = '';
	let filter = '';

	const addSize = (property: string, value: string, defaultUnit = 'px') => {
		const unit = /\D/.exec(value) ? '' : defaultUnit;
		style += `${property}:${value}${unit};`;
	};
	const addFilter = (type: string, value: string, defaultValue: string) => {
		filter += `${type}(${value || defaultValue}) `;
	};

	contents.forEach((content) => {
		if (content.startsWith('w:')) {
			addSize('width', content.slice(2));
		} else if (content.startsWith('h:')) {
			addSize('height', content.slice(2));
		} else if (content.startsWith('blur')) {
			addFilter('blur', content.slice(5), '10px');
		} else if (content.startsWith('brightness')) {
			addFilter('brightness', content.slice(10), '1.5');
		} else if (content.startsWith('contrast')) {
			addFilter('contrast', content.slice(8), '2');
		} else if (content.startsWith('drop-shadow')) {
			addFilter('drop-shadow', content.slice(11), '0 5px 10px rgba(0,0,0,.4)');
		} else if (content.startsWith('grayscale')) {
			addFilter('grayscale', content.slice(9), '1');
		} else if (content.startsWith('hue-rotate')) {
			addFilter('hue-rotate', content.slice(11), '180deg');
		} else if (content.startsWith('invert')) {
			addFilter('invert', content.slice(6), '1');
		} else if (content.startsWith('opacity')) {
			addFilter('opacity', content.slice(7), '0.5');
		} else if (content.startsWith('saturate')) {
			addFilter('saturate', content.slice(9), '2');
		} else if (content.startsWith('sepia')) {
			addFilter('sepia', content.slice(6), '1');
		}
	});

	if (filter) {
		style += `filter:${filter};`;
	}
	return style;
};
