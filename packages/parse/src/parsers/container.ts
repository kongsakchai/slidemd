import { asciiAlpha, asciiAlphanumeric, markdownLineEnding } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { nonLazyPartialTokenizer, spacePartialTokenizer } from './line-space'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
const tokenizer: Construct = {
	name: 'html',
	tokenize: tokenize,
	concrete: true
}

export const attribute: Extension = {
	document: {
		[codes.colon]: tokenizer
	}
}

const closeContainerPartialTokenizer: Construct = {
	tokenize: closeContainerTokenize,
	partial: true
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let size = 0
	let previous: Token | undefined = undefined

	return start

	function start(code: Code) {
		effects.enter('container')
		effects.enter('containerSequence')
		return startLabel(code)
	}

	function startLabel(code: Code) {
		if (code === codes.colon) {
			if (size > 3) return nok(code)
			size++
			effects.consume(code)
			return startLabel
		}

		if (size < 3) return nok(code)

		return startName(code)
	}

	// --- Name

	function startName(code: Code) {
		if (code === codes.eof || !asciiAlpha(code)) {
			return nok(code)
		}

		effects.exit('containerSequence')
		effects.enter('containerName')
		effects.consume(code)
		return containerName
	}

	function containerName(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit('containerName')
			effects.attempt(spacePartialTokenizer, startAttribute, endLabel)(code)
		}

		// Continue container name
		if (code != null && (code === codes.dash || asciiAlphanumeric(code))) {
			effects.consume(code)
			return containerName
		}

		return nok(code)
	}

	// --- Attribute

	function startAttribute(code: Code) {
		effects.enter('containerAttribute')
		return attribute(code)
	}

	function attribute(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit('containerAttribute')
			return endLabel(code)
		}

		effects.consume(code)
		return attribute
	}

	function endLabel(code: Code) {
		if (code === codes.eof) {
			return done(code)
		}

		if (markdownLineEnding(code)) {
			return effects.attempt(nonLazyPartialTokenizer, endLabel, done)(code)
		}

		return startContent(code)
	}

	// --- Content

	function startContent(code: Code) {
		effects.enter('containerContent')
		return checkNextLineContent(code)
	}

	function checkNextLineContent(code: Code) {
		return effects.attempt(closeContainerPartialTokenizer, afterContent, content)(code)
	}

	function content(code: Code) {
		if (code === codes.eof) {
			return afterContent(code)
		}

		if (markdownLineEnding(code)) {
			return effects.check(nonLazyPartialTokenizer, checkNextLineContent, afterContent)(code)
		}

		return startDocument(code)
	}

	function afterContent(code: Code) {
		effects.exit('containerContent')
		return done(code)
	}

	// --- Document

	function startDocument(code: Code) {
		const token = effects.enter(types.chunkDocument, {
			contentType: constants.contentTypeDocument,
			previous: previous
		})
		if (previous) previous.next = token
		previous = token
		return document(code)
	}

	function document(code: Code) {
		if (code === codes.eof) {
			effects.exit(types.chunkDocument)
			return afterContent(code)
		}

		if (markdownLineEnding(code)) {
			return effects.check(nonLazyPartialTokenizer, checkNextLineDocument, endDocument)(code)
		}

		effects.consume(code)
		return document
	}

	function checkNextLineDocument(code: Code) {
		effects.consume(code)
		effects.exit(types.chunkDocument)
		return checkNextLineContent
	}

	function endDocument(code: Code) {
		effects.exit(types.chunkDocument)
		return afterContent(code)
	}

	function done(code: Code) {
		effects.exit('container')
		return ok(code)
	}
}

function closeContainerTokenize(effects: Effects, ok: State, nok: State): State {
	let size = 0

	return start

	function start(code: Code) {
		if (code === codes.eof || code !== codes.colon) {
			return nok(code)
		}

		effects.enter('containerSequence')
		return more(code)
	}

	function more(code: Code) {
		if (code === codes.colon) {
			if (size > 3) return nok(code)
			size++
			effects.consume(code)
			return more
		}

		if (size < 3) return nok(code)

		effects.exit('containerSequence')
		return ok(code)
	}
}
