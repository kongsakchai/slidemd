import { describe, expect } from 'vitest'

import { Parse, Testcase, runTest } from './helper'

export function htmlTestcase(parse: Parse) {
	describe('html flow', () => {
		describe('normal html', () => {
			const testcase: Testcase[] = [
				{
					title: 'should return div tag',
					value: '<div>hello, markdown</div>',
					expected: '<div>hello, markdown</div>'
				},
				{
					title: 'should return div with attributes',
					value: '<div {id} class="bg-primary {className}">hello, markdown</div>',
					expected: '<div {id} class="bg-primary {className}">hello, markdown</div>'
				},
				{
					title: 'should return img with shorthand',
					value: `<img {src} />`,
					expected: `<img {src} />`
				},
				{
					title: 'should return raw',
					value: `<script lang="ts" module>let count = $state(0);let a = count<10;</script>`,
					expected: `<script lang="ts" module>let count = $state(0);let a = count<10;</script>`
				},
				{
					title: 'should return comment',
					value: `<!-- hello, world -_--->`,
					expected: `<!-- hello, world -_--->`
				},
				{
					title: 'should return empty comment',
					value: `<!---->`,
					expected: `<!---->`
				},
				{
					title: 'should return instrcutions',
					value: '<?php?>',
					expected: '<?php?>'
				},
				{
					title: 'should return declarations',
					value: '<!DOCUMENT test>',
					expected: '<!DOCUMENT test>'
				},
				{
					title: 'should return cdata',
					value: '<![CDATA[] ]]>',
					expected: '<![CDATA[] ]]>'
				},
				{
					title: 'should return auto link',
					value: '<https://svelte.dev/>',
					expected: '<p><a href="https://svelte.dev/">https://svelte.dev/</a></p>'
				},
				{
					title: 'should return component',
					value: '<Component />',
					expected: '<Component />'
				},
				{
					title: 'should return closing tag',
					value: '</div > this will consumed by html flow',
					expected: '</div > this will consumed by html flow'
				},
				{
					title: 'should return html with next blank line',
					value: '<div>hello, markdown</div>\n     ',
					expected: '<div>hello, markdown</div>'
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})

		describe('multiple line', () => {
			const testcase: Testcase[] = [
				{
					title: 'should return multiple line div',
					value: '<div>\n# hello, markdown\n\n# hello, remark\n\n</div>',
					expected: '<div>\n# hello, markdown\n<h1>hello, remark</h1>\n</div>'
				},
				{
					title: 'should return raw multiple line',
					value: `<script lang="ts" module>\n\nlet count = $state(0);\n</script>`,
					expected: `<script lang="ts" module>\n\nlet count = $state(0);\n</script>`
				},
				{
					title: 'should return multiple line comment',
					value: `<!-- \n\n# hello, world\n -->`,
					expected: `<!-- \n\n# hello, world\n -->`
				},
				{
					title: 'should return multiple line instrcutions',
					value: '<?php \n?\n?\n ?>',
					expected: '<?php \n?\n?\n ?>'
				},
				{
					title: 'should return multiple line cdata',
					value: '<![CDATA[ \n]\n]]\n ]]>',
					expected: '<![CDATA[ \n]\n]]\n ]]>'
				},
				{
					title: 'should return multiple line cdata',
					value: '<![CDATA[ \n]\n]]\n ]]>',
					expected: '<![CDATA[ \n]\n]]\n ]]>'
				},
				{
					title: 'should return multiple with lazy',
					value: '> <div>\n555555</div>',
					expected: '<blockquote>\n<div>\n</blockquote>\n<p>555555</div></p>'
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})

		describe('interrupt', () => {
			const testcase: { title: string; value: string; expected: string }[] = [
				{
					title: 'should interrupt when html are basic tag',
					value: `hello, markdown\n<div>this should interrupt</div>`,
					expected: `<p>hello, markdown</p>\n<div>this should interrupt</div>`
				},
				{
					title: 'should interrupt when closing html are basic tag',
					value: `hello, markdown\n</div>`,
					expected: `<p>hello, markdown</p>\n</div>`
				},
				{
					title: 'should not interrupt when html are not basic tag and are not lazy line',
					value: `hello, markdown\n<span>this should not interrupt</span>`,
					expected: `<p>hello, markdown\n<span>this should not interrupt</span></p>`
				},
				{
					title: 'should interrupt when html are not basic tag and are lazy line',
					value: `> hello, markdown\n<span>this should interrupt</span>`,
					expected: `<blockquote>\n<p>hello, markdown</p>\n</blockquote>\n<span>this should interrupt</span>`
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})

		describe('invalid html', () => {
			const testcase: { title: string; value: string; expected: string }[] = [
				{
					title: 'should normal text when invalid character in tag name',
					value: `<@div>hello, markdown<$div>`,
					expected: `<p>&#x3C;@div>hello, markdown&#x3C;$div></p>`
				},
				{
					title: 'should normal text when complete tag end without `>`',
					value: `<Complete/`,
					expected: `<p>&#x3C;Complete/</p>`
				},
				{
					title: 'should normal text when comment have invalid prefix',
					value: `<!- -->`,
					expected: `<p>&#x3C;!- --></p>`
				},
				{
					title: 'should normal text when cdata have invalid prefix',
					value: `<![CDAT[]]>`,
					expected: `<p>&#x3C;![CDAT[]]></p>`
				},
				{
					title: 'should normal text when prefix is <! with not -, {, alpha',
					value: `<!@ >`,
					expected: `<p>&#x3C;!@ ></p>`
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})
	})

	describe('html text', () => {
		describe('normal html', () => {
			const testcase: { title: string; value: string; expected: string }[] = [
				{
					title: 'should return div tag',
					value: 'Hello <div>markdown</div >',
					expected: '<p>Hello <div>markdown</div ></p>'
				},
				{
					title: 'should return div with attributes',
					value: `Hello <div {id} class="bg-primary }' {className}">markdown</div>`,
					expected: `<p>Hello <div {id} class="bg-primary }' {className}">markdown</div></p>`
				},
				{
					title: 'should return div with shorthand',
					value: `Hello <div {className}>markdown</div>`,
					expected: `<p>Hello <div {className}>markdown</div></p>`
				},
				{
					title: 'should return img with shorthand',
					value: `Hello <img {src} />`,
					expected: `<p>Hello <img {src} /></p>`
				},
				{
					title: 'should return comment',
					value: `Hello <!-- markdown -_--->`,
					expected: `<p>Hello <!-- markdown -_---></p>`
				},
				{
					title: 'should return empty comment',
					value: `Hello <!---->`,
					expected: `<p>Hello <!----></p>`
				},
				{
					title: 'should return instrcutions',
					value: 'Hello <?php?>',
					expected: '<p>Hello <?php?></p>'
				},
				{
					title: 'should return declarations',
					value: 'Hello <!DOCUMENT test>',
					expected: '<p>Hello <!DOCUMENT test></p>'
				},
				{
					title: 'should return cdata',
					value: 'Hello <![CDATA[] ]]]>',
					expected: '<p>Hello <![CDATA[] ]]]></p>'
				},
				{
					title: 'should return auto link',
					value: 'Hello <https://svelte.dev/>',
					expected: '<p>Hello <a href="https://svelte.dev/">https://svelte.dev/</a></p>'
				},
				{
					title: 'should return component',
					value: 'Hello <Component />',
					expected: '<p>Hello <Component /></p>'
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})

		describe('multiple line', () => {
			const testcase: { title: string; value: string; expected: string }[] = [
				{
					title: 'should return multiple line content',
					value: 'Hello <div >\nmarkdown\n</div>',
					expected: '<p>Hello <div >\nmarkdown</p>\n</div>'
				},
				{
					title: 'should return div with multiple line attriube',
					value: 'Hello <div\nclass="bg-red-500">markdown</div>',
					expected: '<p>Hello <div\nclass="bg-red-500">markdown</div></p>'
				},
				{
					title: 'should return div with multiple line attriube',
					value: 'Hello <div\nclass="bg-red-500"\n  id="id">markdown</div>',
					expected: '<p>Hello <div\nclass="bg-red-500"\nid="id">markdown</div></p>'
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})

		describe('invalid html', () => {
			const testcase: { title: string; value: string; expected: string }[] = [
				{
					title: 'should normal text when incomplete tag',
					value: `Hello <div markdown`,
					expected: `<p>Hello &#x3C;div markdown</p>`
				},
				{
					title: 'should normal text when incomplete multiple line',
					value: 'Hello <div\n',
					expected: '<p>Hello &#x3C;div</p>'
				}
			]

			runTest(testcase, 'all', async (t) => {
				const file = await parse(t.value)
				expect(file).toEqual(t.expected)
			})
		})
	})
}
