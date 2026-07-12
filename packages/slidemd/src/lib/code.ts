import { codeToKeyedTokens, createMagicMoveMachine } from '@shikijs/magic-move/core'
import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight
} from '@shikijs/transformers'
import { type Attribute, type CodeContainer, type CodeHighlighter, asString } from '@slidemd/parser'

import lz from 'lz-string'
import { type SpecialLanguage, createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const jsEngine = createJavaScriptRegexEngine()

const themes = {
	light: 'github-light',
	dark: 'github-dark'
}

const transformers = [
	transformerNotationDiff(),
	transformerNotationHighlight(),
	transformerNotationWordHighlight(),
	transformerNotationFocus(),
	transformerNotationErrorLevel(),
	transformerMetaHighlight(),
	transformerMetaWordHighlight()
]

const highlighter = await createHighlighter({
	langs: ['go', 'javascript', 'typescript', 'yaml', 'html', 'css', 'svelte', 'markdown', 'plaintext'],
	themes: ['github-light', 'github-dark'],
	engine: jsEngine
})

const CODE_SPLIT_REGEX = /^>>>>>$/gm

export function createCodeHighlighter() {
	const codeContainer: CodeContainer = async (lang, attrs) => {
		if (lang === 'mermaid') {
			attrs.class = asString(attrs.class, '').replace('language-mermaid', 'mermaid-container')
			attrs.name = 'mermaid'

			return {
				type: 'container',
				data: {
					hName: 'div',
					hProperties: attrs,
					hChildren: []
				},
				children: []
			}
		}

		return {
			type: 'container',
			data: {
				hName: 'div',
				hProperties: attrs,
				hChildren: [
					{
						type: 'raw',
						value: `<button title="copy code button" class="copy" onclick={window.copyCode}></button>`
					},
					{ type: 'raw', value: `<span class="lang">${lang}</span>` }
				]
			},
			children: []
		}
	}

	const codeHighlighter: CodeHighlighter = async (lang: string, code: string, attr?: Attribute, meta?: string) => {
		if (lang === 'mermaid') {
			return {
				type: 'element',
				tagName: 'pre',
				properties: {},
				children: [{ type: 'text', value: code }]
			}
		}

		try {
			if (!highlighter.getLoadedLanguages().includes(lang)) {
				await highlighter.loadLanguage(lang as SpecialLanguage)
			}
		} catch {
			console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m Failed to load language: ${lang}`)
			lang = 'plaintext'
		}

		if (attr?.step == null) {
			return highlighter.codeToHast(code, {
				lang: lang,
				meta: {
					__raw: meta
				},
				defaultColor: false,
				themes: themes,
				transformers
			})
		}

		const magicMove = createMagicMoveMachine((code) =>
			codeToKeyedTokens(
				highlighter,
				code,
				{
					lang: lang as SpecialLanguage,
					defaultColor: false,
					themes: themes
				},
				true
			)
		)

		const codeSteps = code.split(CODE_SPLIT_REGEX)
		const compressed = JSON.stringify(codeSteps.map((code) => magicMove.commit(code.trim()).current))

		attr.step = codeSteps.length
		return {
			type: 'element',
			tagName: 'CodeStepBlock',
			properties: { code: lz.compressToBase64(compressed) },
			children: []
		}
	}

	return { codeContainer, codeHighlighter }
}
