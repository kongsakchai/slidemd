import type { PluginSimple } from 'markdown-it';
import type { Token } from 'markdown-it/index.js';
import {
	filterImageToken,
	filterInlineImageToken,
	joinAttrs,
	removeChildrenToken,
	removeToken,
	resolveAssetUrl
} from './helper';

export const enhancedImage: PluginSimple = (md) => {
	md.core.ruler.after('inline', 'enhanceImage', (state) => {
		const background: Token[] = [];
		const inlineImageTokens = state.tokens.filter(filterInlineImageToken);

		const addBackground = (parent: Token, token: Token) => {
			if (!token.attrGet('bg')) return;
			background.push(token);
			removeChildrenToken(parent, token);
		};

		const addBackgroundContainer = () => {
			if (background.length === 0) return;
			const token = new state.Token('image', 'bg', 0);
			token.children = background;
			state.tokens.push(token);
		};

		inlineImageTokens.forEach((inlineImage) => {
			const imageTokens = inlineImage.children!.filter(filterImageToken);
			imageTokens.forEach((token) => {
				enhanceImageToken(token, state.env);
				addBackground(inlineImage, token);
			});

			if (inlineImage.children?.length === 0) {
				removeToken(state.tokens, inlineImage);
			}
		});

		addBackgroundContainer();
	});

	md.renderer.rules.image = (tokens, idx) => {
		const token = tokens[idx];
		if (token.tag === 'bg') {
			return renderBackgroundContainer(token.children!);
		}
		return renderImage(token);
	};
};

const renderImage = (token: Token) => {
	return `<img ${joinAttrs(token.attrs)}>`;
};

const renderBackgroundContainer = (tokens: Token[]) => {
	const backgrounds = tokens.map((token) => renderBackground(token));
	return `<div class="background-container">${backgrounds.join('\n')}</div>`;
};

const renderBackground = (token: Token) => {
	const src = token.attrGet('src') ?? '';
	token.attrSet('src', '');
	token.attrJoin('style', 'background-image:url(' + src + ');');
	token.attrJoin('class', 'background-image');
	return `<div ${joinAttrs(token.attrs)}></div>`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const enhanceImageToken = (token: Token, env: any) => {
	const src = token.attrGet('src') ?? '';
	const contents = token.content.split(' ');

	token.attrSet('src', resolveAssetUrl(src, env.base));
	token.attrSet('style', extractImageStyle(contents));
	token.attrSet('class', extractImageClass(contents));
	token.attrSet('alt', contents[0]);

	if (contents.includes('bg')) {
		token.attrSet('bg', 'true');
	}
};

const extractImageClass = (contents: string[]): string => {
	const convertClass = (content: string) => {
		if (content === 'bg') return 'background-image';
		return content.slice(1);
	};

	return contents
		.filter((content) => content.startsWith('.') || content === 'bg')
		.map(convertClass)
		.join(' ');
};

const extractImageStyle = (contents: string[]): string => {
	let style = '';
	let filter = '';

	let bgImage = false;
	let bgImageSize = '';
	let bgImageRepeat = '';

	const percentage = /^\d+%$/;
	const sizeMap: Record<string, string> = {
		cover: 'cover',
		contain: 'contain',
		fit: 'contain',
		auto: 'auto'
	};

	const addSize = (property: string, value: string, defaultUnit = 'px') => {
		const unit = /\D/.test(value) ? '' : defaultUnit;
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
		} else if (content === 'bg') {
			bgImage = true;
		} else if (sizeMap[content]) {
			bgImageSize = sizeMap[content];
		} else if (percentage.test(content)) {
			bgImageSize = content;
		} else if (content === 'repeat') {
			bgImageRepeat = 'repeat';
		}
	});

	if (filter) {
		style += `filter:${filter};`;
	}
	if (bgImageSize) {
		style += `background-size:${bgImageSize};`;
	}
	if (bgImageRepeat) {
		style += `background-repeat:${bgImageRepeat};`;
	}
	if (bgImage && (style.includes('width') || style.includes('height'))) {
		style += 'flex:none;';
	}

	return style;
};
