import { describe, expect } from 'vitest'

import { Testcase, runTest } from '../helper'
import { parse } from './init-parser'

describe('container syntax', () => {
	describe('success', () => {
		const testcase: Testcase[] = [
			{
				title: 'should return div without content',
				value: ':::div\n:::',
				expected: '<div></div>'
			},
			{
				title: 'should return section without content',
				value: ':::section\n:::',
				expected: '<section></section>'
			},
			{
				title: 'should return container with content',
				value: ':::div\n# Hello\n:::',
				expected: '<div><h1>Hello</h1></div>'
			},
			{
				title: 'should return container with content after blank line',
				value: ':::div\n# Header1\n ## Header2\n:::',
				expected: '<div><h1>Header1</h1><h2>Header2</h2></div>'
			},
			{
				title: 'should return container with attribute',
				value: ':::main .bg-red-500 .text-white disable #test data-click="hello markdown"\n:::',
				expected: '<main class="bg-red-500 text-white" disable id="test" data-click="hello markdown"></main>'
			},
			{
				title: 'should return container when only name',
				value: ':::main',
				expected: '<main></main>'
			},
			{
				title: 'should return container when only name and newline',
				value: ':::main\n\n',
				expected: '<main></main>'
			},
			{
				title: 'should return container without closing',
				value: ':::main\nhello, markdown',
				expected: '<main><p>hello, markdown</p></main>'
			},
			{
				title: 'should return container without closing #2',
				value: ':::main\nhello, markdown\n',
				expected: '<main><p>hello, markdown</p></main>'
			},
			{
				title: 'should return container bun closing invalid',
				value: ':::main\nhello, markdown\n::::',
				expected: '<main><p>hello, markdown\n::::</p></main>'
			},
			{
				title: 'should return container bun closing invalid #2',
				value: ':::main\nhello, markdown\n::',
				expected: '<main><p>hello, markdown\n::</p></main>'
			},
			{
				title: 'should return container and sub container',
				value: ':::main \n:::div\nin div\n:::\nin main\n:::',
				expected: '<main><div><p>in div</p></div><p>in main</p></main>'
			},
			{
				title: 'should return container and one character in name',
				value: ':::m',
				expected: '<m></m>'
			},
			{
				title: 'should return multiple container',
				value: ':::div .bg-red-500\n:::\n:::div\n:::',
				expected: '<div class="bg-red-500"></div>\n<div></div>'
			},
			{
				title: 'should return container with svelte attribute',
				value: ':::div style:position="relative"\n:::\n:::div\n:::',
				expected: '<div style:position="relative"></div>\n<div></div>'
			}
		]

		runTest(testcase, 'all', async (t) => {
			const file = await parse(t.value)
			expect(file).toBe(t.expected)
		})
	})

	// describe('invalid', () => {
	// 	const testcase: Testcase[] = [
	// 		{
	// 			title: 'should return normal text when prefix invalid',
	// 			value: '::div\n:::',
	// 			expected: '<p>::div\n:::</p>'
	// 		},
	// 		{
	// 			title: 'should return normal text when prefix invalid',
	// 			value: '::::div\n:::',
	// 			expected: '<p>::::div\n:::</p>'
	// 		},
	// 		{
	// 			title: 'should return normal text when missing name',
	// 			value: '::: data=10\n:::',
	// 			expected: '<p>::: data=10\n:::</p>'
	// 		}
	// 	]

	// 	runTest(testcase, 'all', async (t) => {
	// 		const file = await parse(t.value)
	// 		expect(file).toBe(t.expected)
	// 	})
	// })
})
