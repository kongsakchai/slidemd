import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token.mjs';
import { describe, expect, test } from 'vitest';
import { enhancedImage, enhanceImageToken } from './image';

describe('enhancedImage', () => {
	test('should render image', () => {
		const markdown = `![alt](http://www.example.com/image.png)`;
		const expected = `<img src="http://www.example.com/image.png" alt="alt">`;
		const md = new MarkdownIt().use(enhancedImage);

		const result = md.render(markdown);
		expect(result).include(expected);
	});

	test('should render background image', () => {
		const markdown = `![bg](http://www.example.com/image.png)`;
		const expected = `<div class="background-container"><div style=" background-image:url(http://www.example.com/image.png);" class="background-image" bg="true"></div></div>`;
		const md = new MarkdownIt().use(enhancedImage);

		const result = md.render(markdown);
		expect(result).equal(expected);
	});
});

describe('enhancedImageToken', () => {
	test('should return image token with url asset when src is absolute', () => {
		const token = new Token('image', 'img', 0);
		token.attrSet('src', '/example.com');
		const expected = '/assets/L2V4YW1wbGUuY29t';

		enhanceImageToken(token, {});
		expect(token.attrGet('src')).toBe(expected);
	});

	test('should return image token with style', () => {
		const token = new Token('image', 'img', 0);
		token.content = `alt w:50 h:50px blur-sm brightness:1 contrast drop-shadow-sm grayscale hue-rotate invert opacity saturate sepia`;
		const expected = `width:50px;height:50px;filter:blur(10px) brightness(1) contrast(2) drop-shadow(0 5px 10px rgba(0,0,0,.4)) grayscale(1) hue-rotate(180deg) invert(1) opacity(0.5) saturate(2) sepia(1) ;`;

		enhanceImageToken(token, {});
		expect(token.attrGet('style')).toBe(expected);
	});

	test('should return image token with background image style', () => {
		const token = new Token('image', 'img', 0);
		token.content = `bg 50% repeat w:50`;
		const expected = `width:50px;background-size:50%;background-repeat:repeat;flex:none;`;

		enhanceImageToken(token, {});
		expect(token.attrGet('style')).toBe(expected);
		expect(token.attrGet('bg')).toBeTruthy();
	});

	test('should return image token with background image size style', () => {
		const token = new Token('image', 'img', 0);
		token.content = `bg cover`;
		const expected = `background-size:cover;`;

		enhanceImageToken(token, {});
		expect(token.attrGet('style')).toBe(expected);
		expect(token.attrGet('bg')).toBeTruthy();
	});

	test('should return image token with class', () => {
		const token = new Token('image', 'img', 0);
		token.content = `.bg-red-500 bg`;
		const expected = `bg-red-500 background-image`;

		enhanceImageToken(token, {});
		expect(token.attrGet('class')).toBe(expected);
	});
});
