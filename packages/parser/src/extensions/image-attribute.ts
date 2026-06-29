import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { createAttributeTokenize } from './attribute'

// Tokenize

const partialAttributeTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects, ok, nok) {
		return createAttributeTokenize(effects, ok, nok, codes.rightSquareBracket)
	}
}

const imageAttributeTokenizer: Construct = {
	name: 'attributeImage',
	concrete: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
		const { events } = this

		function start(code: Code) {
			if (events[0][1].type !== types.labelImage) return nok(code)
			effects.enter('attributeImage')
			effects.consume(code)
			return effects.attempt(partialAttributeTokenizer, closeAttribute, closeAttribute)
		}

		function closeAttribute(code: Code) {
			if (markdownLineEnding(code)) {
				effects.exit('attributeImage')
				effects.enter(types.lineEnding)
				effects.consume(code)
				effects.exit(types.lineEnding)
				effects.enter('attributeImage')
				return effects.attempt(partialAttributeTokenizer, closeAttribute, closeAttribute)
			}
			effects.exit('attributeImage')
			return ok(code)
		}

		return start
	}
}

export const imageAttribute: Extension = {
	text: { [codes.verticalBar]: imageAttributeTokenizer }
}

// From markdown

export const imageAttributeFromMarkdown: FromMarkdownExtension = {
	exit: { attributeImage: exitAttributeImage }
}

function exitAttributeImage(this: CompileContext) {
	for (let index = this.stack.length - 1; index > 0; index--) {
		const node = this.stack[index]
		if (node?.type !== 'image') continue

		node.data ??= { hProperties: {} }
		node.data.hProperties = { ...node.data.hProperties, ...this.data.attr }
		this.data.attr = {}

		const fragment = this.stack[index + 1]
		if (fragment?.type === 'fragment') {
			const firstChild = fragment.children[0]
			if (firstChild?.type === 'text') firstChild.value = firstChild.value.trim()
		}

		break
	}
}
