import Token from 'markdown-it/lib/token.mjs';
import { describe, expect, test } from 'vitest';
import {
	clearEmptyParagraphToken,
	filterCommentContent,
	filterHTMLComentToken,
	filterHTMLToken,
	filterImageToken,
	filterInlineToken,
	isGlobalOption,
	isLocalOption,
	joinAttrs,
	removeChildrenToken,
	removeToken,
	resolveAssetUrl
} from './helper';

describe('filter', () => {
	test('should return two when token type is image', () => {
		const token = new Token('image', '', 0);
		expect(filterImageToken(token)).toBeTruthy();
	});

	test('should return true when token type is inline', () => {
		const token = new Token('inline', '', 0);
		expect(filterInlineToken(token)).toBeTruthy();
	});

	test('should return true when token is html comment', () => {
		const token = new Token('html_block', '', 0);
		token.content = '<!-- comment -->\n';

		expect(filterCommentContent(token)).toBeTruthy();
	});

	test('should return true when token is html block', () => {
		const token = new Token('html_block', '', 0);
		expect(filterHTMLToken(token)).toBeTruthy();
	});

	test('should return true when token is html comment', () => {
		const token = new Token('html_block', '', 0);
		token.content = '<!-- comment -->\n';

		expect(filterHTMLComentToken(token)).toBeTruthy();
	});
});

describe('remove', () => {
	test('should remove children token', () => {
		const token = new Token('inline', '', 0);
		const children = new Token('image', '', 0);
		token.children = [children];

		removeChildrenToken(token, children);
		expect(token.children).toHaveLength(0);
	});

	test('should can not remove when token have not children', () => {
		const token = new Token('inline', '', 0);
		token.children = [new Token('text', '', 0)];
		const deleteToken = new Token('image', '', 0);

		removeChildrenToken(token, deleteToken);
		expect(token.children).toHaveLength(1);
	});

	test('should remove token', () => {
		const state = [new Token('text', '', 0)];
		const token = state[0];

		removeToken(state, token);
		expect(state).toHaveLength(0);
	});

	test('should can not remove token', () => {
		const state = [new Token('text', '', 0)];
		const token = new Token('text', '', 0);

		removeToken(state, token);
		expect(state).toHaveLength(1);
	});

	test('should remove empty paragraph token', () => {
		const state = [new Token('paragraph_open', 'p', 0), new Token('paragraph_close', 'p', 0)];

		clearEmptyParagraphToken(state);
		expect(state).toHaveLength(0);
	});

	test('should can not remove not empty paragraph token', () => {
		const state = [new Token('paragraph_open', 'p', 0), new Token('text', '', 0), new Token('paragraph_close', 'p', 0)];

		clearEmptyParagraphToken(state);
		expect(state).toHaveLength(3);
	});
});

describe('option', () => {
	test('should return true when key is local option', () => {
		const key = '_class';
		expect(isLocalOption(key)).toBeTruthy();
	});

	test('should return false when key is not local option', () => {
		const key = '_hello';
		expect(isLocalOption(key)).toBeFalsy();
	});

	test('should return false when key is global option', () => {
		const key = 'class';
		expect(isLocalOption(key)).toBeFalsy();
	});

	test('should return true when key is global', () => {
		const key = 'class';
		expect(isGlobalOption(key)).toBeTruthy();
	});

	test('should return false when key is not global', () => {
		const key = 'hello';
		expect(isGlobalOption(key)).toBeFalsy();
	});
});

describe('attrs', () => {
	test('should return empty string when attrs is null', () => {
		const attrs = null;
		expect(joinAttrs(attrs)).toBe('');
	});

	test('should return attrs string', () => {
		const attrs = [['class', 'hello']] as [string, string][];
		expect(joinAttrs(attrs)).toBe('class="hello"');
	});
});

describe('resolveAssetUrl', () => {
	test('should return url when src is `https://` format', () => {
		const src = 'https://example.com';
		expect(resolveAssetUrl(src)).toBe(src);
	});

	test('should return url asset when src is absolute', () => {
		const src = '/example.com';
		const asset = '/assets/L2V4YW1wbGUuY29t';

		expect(resolveAssetUrl(src)).toBe(asset);
	});

	test('should return url asset when src is relative and base is defined', () => {
		const src = 'example.com';
		const base = 'folder';
		const asset = '/assets/Zm9sZGVyL2V4YW1wbGUuY29t';

		expect(resolveAssetUrl(src, base)).toBe(asset);
	});
});
