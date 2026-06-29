import { Properties } from 'hast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, Token, TokenizeContext } from 'micromark-util-types'

import { createAttributeTokenize } from './attribute.js'

// Tokenize

const partialAttributeTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok, nok) {
		return createAttributeTokenize(effects, ok, nok, codes.rightCurlyBrace)
	}
}

const attributeBlockTokenizer: Construct = {
	name: 'attributeBlock',
	concrete: true,
	tokenize(this: TokenizeContext, effects: Effects, ok, nok) {
		function start(code: Code) {
			effects.enter('attributeBlock')
			effects.enter('attributeBlockSequence')
			effects.consume(code)
			return open
		}

		function open(code: Code) {
			if (code !== codes.leftCurlyBrace) return nok(code)
			effects.consume(code)
			effects.exit('attributeBlockSequence')
			return effects.attempt(partialAttributeTokenizer, beforeClose, beforeClose)
		}

		function beforeClose(code: Code) {
			if (code !== codes.rightCurlyBrace) return nok(code)
			effects.enter('attributeBlockSequence')
			effects.consume(code)
			effects.exit('attributeBlockSequence')
			return close
		}

		function close(code: Code) {
			if (code !== codes.eof && !markdownLineEnding(code)) return nok(code)
			effects.exit('attributeBlock')
			return ok(code)
		}

		return start
	}
}

export const attributeBlock: Extension = {
	text: { [codes.atSign]: attributeBlockTokenizer }
}

// From markdown

function enterAttributeBlock(this: CompileContext, token: Token) {
	this.enter({ type: 'attributeBlock', value: '', attr: {} }, token)
}

function exitAttributeBlock(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)

	if (node?.type === 'attributeBlock') {
		node.attr = this.data.attr

		const parent = this.stack.at(-2) as { data: { hProperties: Properties } } | undefined
		if (parent) {
			parent.data ??= { hProperties: {} }
			parent.data.hProperties = { ...parent.data.hProperties, ...this.data.attr }
		}
	}

	this.exit(token)
}

export const attributeBlockFromMarkdown: FromMarkdownExtension = {
	enter: { attributeBlock: enterAttributeBlock },
	exit: { attributeBlock: exitAttributeBlock }
}
