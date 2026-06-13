import { Properties } from 'hast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { attribute } from './attribute'
import { partialSpaceTokenizer } from './space'

export const imageAttributeTokenizer: Construct = {
	name: 'attributeImage',
	tokenize: tokenize
}

export const imageAttribute: Extension = {
	text: {
		null: imageAttributeTokenizer
	}
}

const partialAttributeTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		return attribute(effects, ok, nok, codes.rightSquareBracket)
	}
}

const partialSpaceAltTextTokenizer: Construct = {
	partial: true,
	tokenize: spaceAltTextTokenize
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const previous = this.previous
	const events = this.events

	return start

	function start(code: Code) {
		console.log('open alt text', String.fromCodePoint(previous), String.fromCodePoint(code))
		if (previous !== codes.leftSquareBracket || code === codes.rightSquareBracket) {
			return nok(code)
		}

		if (events.at(-1)?.[1].type !== types.labelImage) {
			return nok(code)
		}

		return openAltText(code)
	}

	function openAltText(code: Code) {
		if (code === codes.verticalBar) {
			return openAttribute(code)
		}

		effects.enter(types.data)
		return altText(code)
	}

	function altText(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			return nok(code)
		}

		if (code === codes.rightSquareBracket || code === codes.verticalBar) {
			return closeAltText(code)
		}

		if (markdownSpace(code)) {
			return effects.check(partialSpaceAltTextTokenizer, spaceAltText, closeAltText)(code)
		}

		effects.consume(code)
		return altText
	}

	function spaceAltText(code: Code) {
		if (markdownSpace(code)) {
			effects.consume(code)
			return spaceAltText
		}

		return altText(code)
	}

	function closeAltText(code: Code) {
		effects.exit(types.data)
		return effects.attempt(partialSpaceTokenizer, afterAltText, afterAltText)(code)
	}

	function afterAltText(code: Code) {
		if (code === codes.rightSquareBracket) {
			return ok(code)
		}

		if (code === codes.verticalBar) {
			return openAttribute(code)
		}

		return nok(code)
	}

	function openAttribute(code: Code) {
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
