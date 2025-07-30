import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import type { Element, Text } from 'hast'
import { codeToHast } from 'shiki'

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

export const transformShiki = async (pre: Element) => {
	const code = pre.children[0] as Element
	const lang = code.data?.meta as string
	const codeStr = (code.children[0] as Text).value

	const shikiRoot = await codeToHast(codeStr, {
		lang: lang,
		defaultColor: false,
		...shikiOptions
	})
	const shikiPre = shikiRoot.children[0] as Element

	pre.properties = shikiPre.properties
	pre.children = shikiPre.children
}
