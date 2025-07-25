import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype'
import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'
import type { ShikiTransformer } from '@shikijs/types'

export const shiki = rehypeShiki

const addCopyButton = (): ShikiTransformer => {
	return {
		name: 'add-copy-button',
		pre() {
			// console.log('Pre', hast)
		}
	}
}

export const shikiOptions: RehypeShikiOptions = {
	themes: {
		light: 'github-light',
		dark: 'github-dark'
	},
	transformers: [
		addCopyButton(),
		transformerNotationDiff(),
		transformerNotationHighlight(),
		transformerNotationFocus(),
		transformerNotationErrorLevel()
	]
}
