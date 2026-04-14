import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import type { PhrasingContent, Root, RootContent } from 'mdast'
import { createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { Transformer } from 'unified'
import { getAttributes, mapNode } from './helper'

export interface CodeblockOptions {
	disableCopy?: boolean
	copyEventName?: string
}

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

const escapeSpecialCharacters = (str: string) => {
	return str.replace(/[&<>{}]/g, (char) => `{'${char}'}`)
}

function createContainer(lang: string, attrs: Record<string, any>, options?: CodeblockOptions) {
	attrs.class = [`language-${lang}`, attrs.class].filter(Boolean).join(' ')

	const copyEventName = options?.copyEventName ? `onclick="{${options?.copyEventName}}"` : ''
	const copyButton: PhrasingContent[] = options?.disableCopy
		? []
		: [{ type: 'html', value: `<button id="code-copy-btn" class="copy" ${copyEventName}></button>` }]

	const container: RootContent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs
		},
		children: [...copyButton, { type: 'html', value: `<span class="lang">${lang}</span>` }]
	}
	return container
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

	return { type: 'html', value: escapeSpecialCharacters(html) } as RootContent
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
		children: [{ type: 'html', value: escapeSpecialCharacters(code) }]
	}
	return container
}

export function transformerCodeblock(options?: CodeblockOptions): Transformer {
	return async (tree) => {
		const codeblocks = mapNode(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const lang = node.lang || 'plaintext'
			const code = node.value
			const attrs = getAttributes(node.meta)

			const container = lang === 'mermaid' ? createMermaidContainer(attrs) : createContainer(lang, attrs, options)
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
