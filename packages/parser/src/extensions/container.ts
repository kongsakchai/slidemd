import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { asciiAlpha, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { attribute } from './attribute.js'
import { nonLazyPartialTokenizer } from './line.js'
import { partialSpaceTokenizer } from './space.js'

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

const openContainerPartialTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects, ok, nok) {
		return factoryContainerSequence(effects, ok, nok, asciiAlpha)
	}
}

const closeContainerPartialTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		return factoryContainerSequence(effects, ok, nok, (code: Code) => {
			return code === codes.eof || markdownLineEnding(code)
		})
	}
}

const partialAttributeTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		return attribute(effects, ok, nok, codes.eof)
	}
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let previous: Token | undefined = undefined
	let subContainer = 0

	const setNonLazy = (token: Token) => (this.parser.lazy[token.start.line] = false)

	return start

	function start(code: Code) {
		effects.enter('container')
		return effects.attempt(openContainerPartialTokenizer, openName, nok)(code)
	}

	function done(code: Code) {
		effects.exit('container')
		return ok(code)
	}

	// --- Name

	function openName(code: Code) {
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
			return effects.check(partialSpaceTokenizer, attribute, beforeContent)(code)
		}

		effects.consume(code)
		return containerName
	}

	// --- Attribute

	function attribute(code: Code) {
		effects.enter('containerAttribute')
		return effects.attempt(partialAttributeTokenizer, afterAttribute, afterAttribute)(code)
	}

	function afterAttribute(code: Code) {
		effects.exit('containerAttribute')
		return beforeContent(code)
	}

	// --- Content

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

	function openContent(code: Code) {
		effects.enter('containerContent')
		return openDocument(code)
	}

	function closeContent(code: Code) {
		effects.exit('containerContent')
		if (code === codes.eof) {
			return done(code)
		}

		return effects.attempt(closeContainerPartialTokenizer, done, openContent)(code)
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
		return effects.check(openContainerPartialTokenizer, subContainerDocument, document)(code)
	}

	function subContainerDocument(code: Code) {
		subContainer++
		effects.consume(code)
		return document
	}

	function document(code: Code) {
		if (code === codes.eof) return closeDocument(code)

		if (markdownLineEnding(code)) {
			return newLineDocument(code)
		}

		effects.consume(code)
		return document
	}

	function closeDocument(code: Code) {
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return closeContent(code)
	}

	function newLineDocument(code: Code) {
		effects.consume(code)
		const token = effects.exit(types.chunkDocument)
		setNonLazy(token)
		return effects.check(closeContainerPartialTokenizer, beforeCloseContent, openDocument)
	}

	function beforeCloseContent(code: Code) {
		return subContainer-- > 0 ? openDocument(code) : closeContent(code)
	}
}

function factoryContainerSequence(effects: Effects, ok: State, nok: State, endWith: (code: Code) => boolean): State {
	let size = 0

	return start

	function start(code: Code) {
		if (code === codes.eof || code !== codes.colon) return nok(code)
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
		if (size < 3 || !endWith(code)) return nok(code)
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
				hName: '',
				hProperties: {}
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

function exitContainerAttribute(this: CompileContext) {
	const node = this.stack.at(-1)
	if (node?.type === 'container') {
		node.data.hProperties = this.data.attr
		this.data.attr = {}
	}
}
