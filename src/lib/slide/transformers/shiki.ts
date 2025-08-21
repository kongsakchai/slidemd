import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import type { Element, Text } from 'hast'
import { codeToHast, createHighlighter, type BundledLanguage } from 'shiki'

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

const highlight = await createHighlighter({
	langs: ['go', 'javascript', 'typescript', 'yaml', 'html', 'css', 'svelte', 'markdown', 'plaintext'],
	themes: ['github-light', 'github-dark']
})

export const transformShiki = async (pre: Element) => {
	const code = pre.children[0] as Element
	const lang = code.data?.meta as string
	const codeStr = (code.children[0] as Text).value

	if (!highlight.getLoadedLanguages().includes(lang)) {
		await highlight.loadLanguage(lang as BundledLanguage)
	}

	const shikiRoot = await codeToHast(codeStr, {
		lang: lang,
		defaultColor: false,
		...shikiOptions
	})
	const shikiPre = shikiRoot.children[0] as Element

	pre.properties = shikiPre.properties
	pre.children = shikiPre.children
}
