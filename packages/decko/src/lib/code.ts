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
import { type CodeContainer, type CodeHighlighter } from '@decko/parser'

import lz from 'lz-string'
import { type SpecialLanguage, createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import { compresseAttribute } from './attribute'
import { Feature, getFeatures } from './feature'
import { asString } from './utils'

export const CODE_SPLIT_REGEX = /^>>>>>$/gm

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

export const codeContainer: CodeContainer = async (ctx) => {
	if (ctx.lang === 'mermaid') {
		ctx.attrs.class = asString(ctx.attrs.class, '').replace('language-mermaid', 'mermaid-container')
		ctx.attrs.name = 'mermaid'
		compresseAttribute(ctx.attrs, '{@attach mermaidRender}')

		return {
			type: 'container',
			data: {
				hName: 'div',
				hProperties: ctx.attrs,
				hChildren: []
			},
			children: []
		}
	}

	return {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: ctx.attrs,
			hChildren: [
				{
					type: 'raw',
					value: `<button title="copy code button" class="copy" onclick={window.copyCode}></button>`
				},
				{ type: 'raw', value: `<span class="lang">${ctx.lang}</span>` }
			]
		},
		children: []
	}
}

export const codeHighlighter: CodeHighlighter = async (ctx) => {
	const features = getFeatures(ctx.slideCtx.extra)

	if (ctx.lang === 'mermaid') {
		features.add(Feature.Mermaid)
		return {
			type: 'element',
			tagName: 'pre',
			properties: {},
			children: [{ type: 'text', value: ctx.code }]
		}
	}

	try {
		if (!highlighter.getLoadedLanguages().includes(ctx.lang)) {
			await highlighter.loadLanguage(ctx.lang as SpecialLanguage)
		}
	} catch {
		console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m Failed to load language: ${ctx.lang}`)
		ctx.lang = 'plaintext'
	}

	features.add(Feature.Code)
	if (ctx.attrs.step == null) {
		return highlighter.codeToHast(ctx.code, {
			lang: ctx.lang,
			meta: {
				__raw: ctx.meta
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
				lang: ctx.lang as SpecialLanguage,
				defaultColor: false,
				themes: themes
			},
			true
		)
	)

	const codeSteps = ctx.code.split(CODE_SPLIT_REGEX)
	const codeTokenInfo = JSON.stringify(codeSteps.map((code) => magicMove.commit(code.trim()).current))

	const start = Number.parseInt(asString(ctx.attrs.at, '0'), 10) || 0
	if (!ctx.slide.local) ctx.slide.local = {}
	ctx.slide.local.step = start + codeSteps.length - 1

	return {
		type: 'element',
		tagName: 'CodeStepBlock',
		properties: { code: lz.compressToBase64(codeTokenInfo), start: start },
		children: []
	}
}
