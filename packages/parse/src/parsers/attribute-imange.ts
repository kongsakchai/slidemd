import { Properties } from 'hast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { asciiAlpha, markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { factoryAttribute } from './factory-attribute'
import { spacePartialTokenizer } from './space'

export const attributeImageTokenizer: Construct = {
	name: 'attributeImage',
	tokenize: tokenize
}

export const attributeImage: Extension = {
	text: {
		null: attributeImageTokenizer
	}
}

const attributePartialTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		return factoryAttribute(effects, ok, nok, codes.rightSquareBracket)
	}
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const previous = this.previous
	const events = this.events

	return start

	function start(code: Code) {
		if (previous !== codes.leftSquareBracket || !asciiAlpha(code) || code === codes.rightSquareBracket) {
			return nok(code)
		}

		let i = events.length
		while (--i >= 0) {
			if (events[i][1].type === types.labelImage) {
				break
			}
		}

		if (i < 0) return nok(code)

		effects.enter(types.data)
		return altText(code)
	}

	function altText(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) return nok(code)

		if (code === codes.rightSquareBracket) {
			effects.exit(types.data)
			return ok(code)
		}

		if (markdownSpace(code)) {
			effects.exit(types.data)
			return effects.attempt(spacePartialTokenizer, attribute, attribute)(code)
		}

		effects.consume(code)
		return altText
	}

	function attribute(code: Code) {
		if (code === codes.rightSquareBracket) return ok(code)
		effects.enter('attributeImage')
		return effects.attempt(attributePartialTokenizer, closeAttribute, nok)(code)
	}

	function closeAttribute(code: Code) {
		if (code !== codes.rightSquareBracket) return nok(code)
		effects.exit('attributeImage')
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
	while (--index < this.stack.length) {
		const node = this.stack.at(index)
		console.log(node?.type)
		if (node?.type === 'image') {
			console.log(this.data.attr)
			node.data = node.data || (node.data = { hProperties: {} })
			node.data.hProperties = { ...this.data.attr } as Properties
			break
		}
	}
}
