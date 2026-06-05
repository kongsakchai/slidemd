import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { asciiAlpha, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { factoryAttribute } from './factory-attribute.js'
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

const closeContainerPartialTokenizer: Construct = { tokenize: closeContainerTokenize, partial: true }

const attributePartialTokenizer: Construct = { partial: true, tokenize: attributeTokenize }

function attributeTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return factoryAttribute(effects, ok, nok, codes.eof)
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
			if (size >= 3) return nok(code)
			size++
			effects.consume(code)
			return openContainer
		}

		if (size < 3) return nok(code)

		return openName(code)
	}

	function done(code: Code) {
		effects.exit('container')
		return ok(code)
	}

	// --- Name

	function openName(code: Code) {
		if (code === codes.eof || markdownLineEndingOrSpace(code) || !asciiAlpha(code)) {
			return nok(code)
		}

		effects.exit('containerSequence')
		effects.enter('containerName')
		effects.consume(code)
		return containerName
	}

	function containerName(code: Code) {
		if (code === codes.eof) {
			effects.exit('containerName')
			return done(code)
		}

		if (markdownLineEndingOrSpace(code)) {
			return effects.attempt(spacePartialTokenizer, containerAttribute, beforeContent)(code)
		}

		effects.consume(code)
		return containerName
	}

	// --- Attribute

	function containerAttribute(code: Code) {
		return effects.attempt(attributePartialTokenizer, beforeContent, beforeContent)(code)
	}

	function beforeContent(code: Code) {
		if (code === codes.eof) {
			return done(code)
		}

		if (markdownLineEnding(code)) {
			return effects.attempt(nonLazyPartialTokenizer, beforeContent, done)(code)
		}

		return effects.attempt(closeContainerPartialTokenizer, done, openContent)(code)
	}

	// --- Content

	function openContent(code: Code) {
		effects.enter('containerContent')
		return openDocument(code)
	}

	function closeContent(code: Code) {
		effects.exit('containerContent')
		return effects.attempt(closeContainerPartialTokenizer, done, openContent)(code)
	}

	// --- Document

	function openDocument(code: Code) {
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
			return effects.check(nonLazyPartialTokenizer, nextLineDocument, closeDocument)(code)
		}

		effects.consume(code)
		return document
	}

	function nextLineDocument(code: Code) {
		effects.consume(code)
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)

		return effects.check(closeContainerPartialTokenizer, closeContent, openDocument)
	}

	function closeDocument(code: Code) {
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
