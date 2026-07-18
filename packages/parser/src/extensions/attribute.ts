import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol'
import type { Code, Effects, State, Token } from 'micromark-util-types'

import { asString } from '../utils.js'
import { partialSpaceTokenizer } from './space.js'

export const isQuote = (code: Code) =>
	code === codes.quotationMark || code === codes.apostrophe || code === codes.graveAccent

// Tokenize

export function createAttributeTokenize(effects: Effects, ok: State, nok: State, closeCode: Code) {
	let markers: Code[] = []

	const latestMarker = () => markers.at(-1) ?? null
	const isEnd = (code: Code) => code === codes.eof || markdownLineEnding(code) || code === closeCode
	const isEndOrSpace = (code: Code) => code === codes.eof || markdownLineEndingOrSpace(code) || code === closeCode

	// Entry

	function start(code: Code) {
		if (isEnd(code)) return nok(code)
		effects.enter('attribute')
		return effects.attempt(partialSpaceTokenizer, openSequence, openSequence)(code)
	}

	function openSequence(code: Code) {
		if (isEnd(code)) return done(code)
		effects.enter('attributeSequence')

		if (code === codes.dot) {
			effects.enter('attributeClass')
			effects.consume(code)
			return attributeClass
		}
		if (code === codes.numberSign) {
			effects.enter('attributeID')
			effects.consume(code)
			return attributeID
		}

		effects.enter('attributeKey')
		effects.consume(code)
		return attributeKey
	}

	function closeSequence(code: Code) {
		effects.exit('attributeSequence')
		if (isEnd(code)) return done(code)
		return effects.attempt(partialSpaceTokenizer, openSequence, openSequence)(code)
	}

	function done(code: Code) {
		effects.exit('attribute')
		return ok(code)
	}

	// Key

	function attributeKey(code: Code) {
		if (isEndOrSpace(code)) {
			effects.exit('attributeKey')
			return closeSequence(code)
		}
		if (code === codes.equalsTo) {
			effects.exit('attributeKey')
			return beforeOpenValue(code)
		}
		effects.consume(code)
		return attributeKey
	}

	// Value

	function beforeOpenValue(code: Code) {
		effects.enter('attributeEqual')
		effects.consume(code)
		effects.exit('attributeEqual')
		return openValue
	}

	function openValue(code: Code) {
		if (isEndOrSpace(code)) return closeSequence(code)

		effects.enter('attributeValue')
		effects.consume(code)

		if (isQuote(code) || code === codes.leftCurlyBrace) {
			markers.push(code)
			return attributeValueScoped
		}

		return attributeValueUnscoped
	}

	function attributeValueUnscoped(code: Code) {
		if (isEndOrSpace(code)) return closeValue(code)
		effects.consume(code)
		return attributeValueUnscoped
	}

	function attributeValueScoped(code: Code) {
		if (latestMarker() == null || code === codes.eof || markdownLineEnding(code)) {
			markers = []
			return closeValue(code)
		}

		if (code === codes.rightCurlyBrace && latestMarker() === codes.leftCurlyBrace) {
			markers.pop()
		} else if (isQuote(code) && latestMarker() === code) {
			markers.pop()
		} else if (isQuote(code) || code === codes.leftCurlyBrace) {
			markers.push(code)
		}

		effects.consume(code)
		return attributeValueScoped
	}

	function closeValue(code: Code) {
		effects.exit('attributeValue')
		return closeSequence(code)
	}

	// Class

	function attributeClass(code: Code) {
		if (isEndOrSpace(code)) {
			effects.exit('attributeClass')
			return closeSequence(code)
		}
		effects.consume(code)
		return attributeClass
	}

	// ID

	function attributeID(code: Code) {
		if (isEndOrSpace(code)) {
			effects.exit('attributeID')
			return closeSequence(code)
		}
		effects.consume(code)
		return attributeID
	}

	return start
}

// From markdown

export const attributeFromMarkdown: FromMarkdownExtension = {
	enter: {
		attribute: enterAttribute,
		attributeSequence: enterAttributeSequence
	},
	exit: {
		attributeSequence: exitAttributeSequence,
		attributeKey: exitAttributeKey,
		attributeValue: exitAttributeValue,
		attributeClass: exitAttributeClass,
		attributeID: exitAttributeID
	}
}

function enterAttribute(this: CompileContext): void {
	this.data.attr = {}
}

function enterAttributeSequence(this: CompileContext): void {
	this.data.attributeKey = undefined
	this.data.attributeValue = undefined
}

function exitAttributeKey(this: CompileContext, token: Token): void {
	const key = this.sliceSerialize(token)
	if (/^[a-zA-Z][\w-:]+$/.test(key)) {
		this.data.attributeKey = key
	}
}

function exitAttributeValue(this: CompileContext, token: Token): void {
	const value = this.sliceSerialize(token)
	this.data.attributeValue =
		value.at(0) === value.at(-1) ? value.replaceAll(/^["']|['"]$/g, '') : value.replaceAll(/^["']$/g, '')
}

function exitAttributeClass(this: CompileContext, token: Token): void {
	this.data.attributeKey = 'class'
	this.data.attributeValue = this.sliceSerialize(token).slice(1)
}

function exitAttributeID(this: CompileContext, token: Token): void {
	this.data.attributeKey = 'id'
	this.data.attributeValue = this.sliceSerialize(token).slice(1)
}

function exitAttributeSequence(this: CompileContext): void {
	const { attr, attributeKey: key, attributeValue: value = '' } = this.data

	if ((key === 'class' || key === 'id') && value) {
		attr[key] = [asString(attr[key]), value].filter(Boolean).join(' ').trim()
	} else if (key) {
		attr[key] = value
	}
}
