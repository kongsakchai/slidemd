import MarkdownIt from 'markdown-it';
import StateCore from 'markdown-it/lib/rules_core/state_core.mjs';
import { describe, expect, test } from 'vitest';
import { pageRule } from './page';

describe('pageRule', () => {
	test('should return val + 1 when paging is not skip or hold', () => {
		const val = 0;
		const state = new StateCore('', new MarkdownIt(), { paging: 'default' });

		const result = pageRule(val, state);
		expect(result).toEqual(1);
	});

	test('should return val when paging is skip', () => {
		const val = 0;
		const state = new StateCore('', new MarkdownIt(), { paging: 'skip' });

		const result = pageRule(val, state);
		expect(result).toEqual(0);
	});

	test('should return val when paging is hold', () => {
		const val = 0;
		const state = new StateCore('', new MarkdownIt(), { paging: 'hold' });

		const result = pageRule(val, state);
		expect(result).toEqual(0);
	});

	test('should return val + 1 when page undefind', () => {
		const val = undefined;
		const state = new StateCore('', new MarkdownIt(), { paging: 'default' });

		const result = pageRule(val, state);
		expect(result).toEqual(1);
	});
});
