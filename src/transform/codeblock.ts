import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import { createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import type { Root, RootContent } from 'mdast'
import type { Transformer } from 'unified'

import { getAttributes, mapNode } from './helper'

const themes = {
	light: 'github-light',
	dark: 'github-dark'
}

const transformers = [
	transformerNotationDiff(),
	transformerNotationHighlight(),
	transformerNotationFocus(),
	transformerNotationErrorLevel()
]

const jsEngine = createJavaScriptRegexEngine()

const highlighter = await createHighlighter({
	langs: ['go', 'javascript', 'typescript', 'yaml', 'html', 'css', 'svelte', 'markdown', 'plaintext'],
	themes: ['github-light', 'github-dark'],
	engine: jsEngine
})

function createcontainer(lang: string, attrs: Record<string, any>) {
	attrs.class = [`language-${lang}`, attrs.class].filter(Boolean).join(' ')
	const container: RootContent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs
		},
		children: [
			{ type: 'html', value: `<button id="code-copy-btn" class="copy"></button>` },
			{ type: 'html', value: `<span class="lang">${lang}</span>` }
		]
	}
	return container
}

async function highlightCode(code: string, lang: string) {
	try {
		if (!highlighter.getLoadedLanguages().includes(lang)) {
			await highlighter.loadLanguage(lang as any)
		}
	} catch {
		lang = 'plaintext'
		console.error(`Failed to load language '${lang}'`)
	}

	const html = highlighter.codeToHtml(code, {
		lang: lang,
		defaultColor: false,
		themes,
		transformers
	})

	return { type: 'html', value: html } as RootContent
}

function createMermaidContainer(attrs: Record<string, any>) {
	const container: RootContent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs
		},
		children: []
	}
	return container
}

async function mermaidBlock(code: string) {
	const container: RootContent = {
		type: 'container',
		data: {
			hName: 'pre',
			hProperties: {
				class: 'mermaid'
			}
		},
		children: [{ type: 'html', value: code }]
	}
	return container
}

export function transformerCodeblock(): Transformer {
	return async (tree) => {
		const codeblocks = mapNode(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const lang = node.lang || 'plaintext'
			const code = node.value
			const attrs = getAttributes(node.meta)

			const container = lang === 'mermaid' ? createMermaidContainer(attrs) : createcontainer(lang, attrs)
			parent.children.splice(index, 1, container)

			return {
				lang,
				code,
				container
			}
		})

		await Promise.all(
			codeblocks.map(async (block) => {
				if (!block) return
				const isMermaid = block.lang === 'mermaid'
				const html = isMermaid ? await mermaidBlock(block.code) : await highlightCode(block.code, block.lang)
				block.container.children.push(html as any)
				return block
			})
		)
	}
}
