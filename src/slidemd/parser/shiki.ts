import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import type { RootContent } from 'hast'
import { type BundledLanguage, createHighlighter, createOnigurumaEngine } from 'shiki'

const shikiOptions = {
	themes: {
		light: 'github-light',
		dark: 'github-dark'
	},
	transformers: [
		transformerNotationDiff(),
		transformerNotationHighlight(),
		transformerNotationFocus(),
		transformerNotationErrorLevel()
	]
}

const highlighter = await createHighlighter({
	langs: ['go', 'javascript', 'typescript', 'yaml', 'html', 'css', 'svelte', 'markdown', 'plaintext'],
	themes: ['github-light', 'github-dark'],
	engine: createOnigurumaEngine(import('shiki/wasm'))
})

export const highlightHast = async (code: string, lang: string) => {
	if (!highlighter.getLoadedLanguages().includes(lang)) {
		try {
			await highlighter.loadLanguage(lang as BundledLanguage)
		} catch {
			lang = 'plaintext'
			console.error(`Failed to load language '${lang}'`)
		}
	}

	const hast = highlighter.codeToHast(code, {
		lang: lang,
		defaultColor: false,
		...shikiOptions
	})

	return hast.children.pop() as RootContent
}
