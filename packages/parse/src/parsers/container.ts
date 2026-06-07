import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { asciiAlpha, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { factoryAttribute } from './factory-attribute.js'
import { nonLazyPartialTokenizer } from './line.js'
import { spacePartialTokenizer } from './space.js'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
export const containerTokenizer: Construct = {
	name: 'container',
	tokenize: tokenize
}

export const container: Extension = {
	flow: {
		[codes.colon]: containerTokenizer
	}
}

const openContainerPartialTokenizer: Construct = { tokenize: openContainerTokenize, partial: true }

const closeContainerPartialTokenizer: Construct = { tokenize: closeContainerTokenize, partial: true }

const attributePartialTokenizer: Construct = { partial: true, tokenize: attributeTokenize }

function attributeTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return factoryAttribute(effects, ok, nok, codes.eof)
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let previous: Token | undefined = undefined
	let subContainer = 0

	const setNonLazy = (token: Token) => (this.parser.lazy[token.start.line] = false)

	return start

	function start(code: Code) {
		effects.enter('container')
		effects.enter('containerSequence')
		return effects.attempt(openContainerPartialTokenizer, openName, nok)(code)
	}

	function done(code: Code) {
		effects.exit('container')
		return ok(code)
	}

	// --- Name

	function openName(code: Code) {
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
			effects.exit('containerName')
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

		// check close before content
		return effects.attempt(closeContainerPartialTokenizer, done, openContent)(code)
	}

	// --- Content

	function openContent(code: Code) {
		effects.enter('containerContent')
		return effects.check(openContainerPartialTokenizer, addSubContainer(openDocument), openDocument)(code)
	}

	function closeContent(code: Code) {
		effects.exit('containerContent')
		if (code === codes.eof) {
			return done(code)
		}

		return effects.attempt(closeContainerPartialTokenizer, done, openContent)(code)
	}

	// --- Sub container

	function addSubContainer(next: State) {
		return (code: Code) => {
			subContainer++
			return next(code)
		}
	}

	// --- Document

	function openDocument(code: Code) {
		if (code === codes.eof) return closeContent(code)

		const token = effects.enter(types.chunkDocument, {
			contentType: constants.contentTypeDocument,
			previous: previous
		})
		if (previous) previous.next = token
		previous = token
		return document(code)
	}

	function document(code: Code) {
		if (code === codes.eof) return closeDocument(code)

		if (markdownLineEnding(code)) {
			return effects.check(nonLazyPartialTokenizer, nextLineDocument, closeDocument)(code)
		}

		effects.consume(code)
		return document
	}

	function closeDocument(code: Code) {
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return closeContent(code)
	}

	function nextLineDocument(code: Code) {
		effects.consume(code)
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return effects.check(closeContainerPartialTokenizer, beforeCloseContent, checkSubContainer)
	}

	function beforeCloseContent(code: Code) {
		if (subContainer-- > 0) return openDocument(code)
		return closeContent(code)
	}

	function checkSubContainer(code: Code) {
		return effects.check(openContainerPartialTokenizer, addSubContainer(openDocument), openDocument)(code)
	}
}

function openContainerTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return factoryContainerSequence(effects, ok, nok, (code: Code) => {
		return asciiAlpha(code)
	})
}

function closeContainerTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return factoryContainerSequence(effects, ok, nok, (code: Code) => {
		return code === codes.eof || markdownLineEnding(code)
	})
}

function factoryContainerSequence(effects: Effects, ok: State, nok: State, endWith: (code: Code) => boolean): State {
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
			if (size >= 3) return nok(code)
			size++
			effects.consume(code)
			return more
		}

		if (size < 3) return nok(code)
		if (!endWith(code)) return nok(code)

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
		containerName: exitContainerName
	}
}

function enterContainer(this: CompileContext, token: Token) {
	this.enter(
		{
			type: 'container',
			children: [],
			data: {
				hName: '',
				hProperties: {}
			}
		},
		token
	)
}

function exitContainer(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)
	if (node?.type === 'container') {
		node.data.hProperties = this.data.attr
	}
	this.exit(token)
}

function exitContainerName(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)
	if (node?.type === 'container') {
		node.data.hName = this.sliceSerialize(token)
	}
}
