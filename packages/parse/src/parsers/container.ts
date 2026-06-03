import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { asciiAlpha, asciiAlphanumeric, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { nonLazyPartialTokenizer } from './line.js'
import { spacePartialTokenizer } from './space.js'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
export const containerTokenizer: Construct = {
	name: 'html',
	tokenize: tokenize,
	concrete: true
}

export const container: Extension = {
	flow: {
		[codes.colon]: containerTokenizer
	}
}

const closeContainerPartialTokenizer: Construct = {
	tokenize: closeContainerTokenize,
	partial: true
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let size = 0
	let previous: Token | undefined = undefined

	const setNonLazy = (token: Token) => (this.parser.lazy[token.start.line] = false)

	return start

	function start(code: Code) {
		effects.enter('container')
		effects.enter('containerSequence')
		return openContainer(code)
	}

	function openContainer(code: Code) {
		if (code === codes.colon) {
			if (size > 3) return nok(code)
			size++
			effects.consume(code)
			return openContainer
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
		if (code === codes.eof || markdownLineEndingOrSpace(code)) {
			effects.exit('containerName')
			return effects.attempt(spacePartialTokenizer, startAttribute, closeOpenContainer)(code)
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
			return closeOpenContainer(code)
		}

		effects.consume(code)
		return attribute
	}

	function closeOpenContainer(code: Code) {
		if (code === codes.eof) {
			return done(code)
		}

		if (markdownLineEnding(code)) {
			return effects.attempt(nonLazyPartialTokenizer, closeOpenContainer, done)(code)
		}

		return startContent(code)
	}

	// --- Content

	function startContent(code: Code) {
		effects.enter('containerContent')
		return checkCloseContainer(code)
	}

	function checkCloseContainer(code: Code) {
		return effects.attempt(closeContainerPartialTokenizer, closeContent, startDocument)(code)
	}

	function closeContent(code: Code) {
		effects.exit('containerContent')
		return done(code)
	}

	function done(code: Code) {
		effects.exit('container')
		return ok(code)
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
			return closeContent(code)
		}

		if (markdownLineEnding(code)) {
			return effects.check(nonLazyPartialTokenizer, checkNextLineDocument, endDocument)(code)
		}

		effects.consume(code)
		return document
	}

	function checkNextLineDocument(code: Code) {
		effects.consume(code)
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return checkCloseContainer
	}

	function endDocument(code: Code) {
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return closeContent(code)
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

// --- HTML
export const containerFromMarkdown: FromMarkdownExtension = {
	enter: {
		container: enterContainer
	},
	exit: {
		container: exitContainer,
		containerName: exitContainerName,
		containerAttribute: exitContainerAttribute
	}
}

function enterContainer(this: CompileContext, token: Token) {
	this.enter(
		{
			type: 'container',
			children: [],
			data: {
				attrs: '',
				hName: ''
			}
		},
		token
	)
}

function exitContainer(this: CompileContext, token: Token) {
	this.exit(token)
}

function exitContainerName(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)
	if (node?.type === 'container') {
		node.data.hName = this.sliceSerialize(token)
	}
}

function exitContainerAttribute(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)
	if (node?.type === 'container') {
		node.data.attrs = this.sliceSerialize(token)
	}
}
