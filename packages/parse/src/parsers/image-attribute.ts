import { Properties } from 'hast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { attribute } from './attribute'

export const imageAttributeTokenizer: Construct = {
	name: 'attributeImage',
	tokenize: tokenize
}

export const imageAttribute: Extension = {
	text: {
		[codes.verticalBar]: imageAttributeTokenizer
	}
}

const partialAttributeTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		return attribute(effects, ok, nok, codes.rightSquareBracket)
	}
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const events = this.events

	return start

	function start(code: Code) {
		if (events[0][1].type !== types.labelImage) {
			return nok(code)
		}

		effects.enter('attributeImage')
		effects.consume(code)
		return effects.attempt(partialAttributeTokenizer, closeAttribute, closeAttribute)
	}

	function closeAttribute(code: Code) {
		if (code !== codes.rightSquareBracket) return nok(code)
		effects.exit('attributeImage')
		return ok(code)
	}
}

function spaceAltTextTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		if (markdownSpace(code)) {
			return nok(code)
		}

		effects.enter(types.linePrefix)
		return more
	}

	function more(code: Code) {
		if (markdownSpace(code)) {
			effects.consume(code)
			return more
		}

		effects.exit(types.linePrefix)
		if (code === codes.rightSquareBracket || code === codes.verticalBar) {
			return nok(code)
		}

		return ok(code)
	}
}

// --- HTML
export const attributeImageFromMarkdown: FromMarkdownExtension = {
	enter: {
		attributeImage: enterToken
	},
	exit: {
		attributeImage: exitToken
	}
}

function enterToken(this: CompileContext) {
	this.data.attr = {}
}

function exitToken(this: CompileContext) {
	let index = this.stack.length
	while (--index > 0) {
		const node = this.stack.at(index)
		if (!node?.type || node.type !== 'image') continue

		node.data = node.data || (node.data = { hProperties: {} })
		node.data.hProperties = { ...this.data.attr } as Properties
		break
	}
}
