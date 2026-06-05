import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol'
import type { Code, Effects, State, Token } from 'micromark-util-types'

import { spacePartialTokenizer } from './space.js'

export const isQoute = (code: Code) =>
	code === codes.quotationMark || code === codes.apostrophe || code === codes.graveAccent

export function factoryAttribute(effects: Effects, ok: State, nok: State, closeCode: Code): State {
	let markers: Code[] = []

	const latestMarker = () => markers.at(-1) || null
	const isClosed = (code: Code) => code === closeCode
	const isSequenceClosed = (code: Code) => code === codes.eof || markdownLineEndingOrSpace(code) || isClosed(code)

	return start

	function start(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			return nok(code)
		}

		effects.enter('attribute')
		return effects.attempt(spacePartialTokenizer, openSequence, openSequence)(code)
	}

	function openSequence(code: Code) {
		effects.enter('attentionSequence')

		if (code === codes.dot) {
			effects.enter('attributeClass')
			effects.consume(code)
			return attributeClass
		}

		if (code === codes.numberSign) {
			effects.enter('attributeID')
			effects.consume(code)
			return attirbuteID
		}

		effects.enter('attributeKey')
		effects.consume(code)
		return attributeKey
	}

	function closeSequence(code: Code) {
		effects.exit('attentionSequence')

		if (code === codes.eof || markdownLineEnding(code) || isClosed(code)) {
			return done(code)
		}

		return effects.attempt(spacePartialTokenizer, openSequence, openSequence)(code)
	}

	function done(code: Code) {
		effects.exit('attribute')
		return ok(code)
	}

	// --- Key

	function attributeKey(code: Code) {
		if (isSequenceClosed(code)) {
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

	// --- Value

	function beforeOpenValue(code: Code) {
		effects.enter('attributeEqual')
		effects.consume(code)
		effects.exit('attributeEqual')
		return openValue
	}

	function openValue(code: Code) {
		if (isSequenceClosed(code)) {
			return closeSequence(code)
		}

		if (isQoute(code) || code === codes.leftCurlyBrace) {
			markers.push(code)
			effects.enter('attributeValue')
			effects.consume(code)
			return attriubteValueWithScope
		}

		effects.enter('attributeValue')
		effects.consume(code)
		return attriubteValueWithoutScope
	}

	function attriubteValueWithoutScope(code: Code) {
		if (isSequenceClosed(code)) {
			return closeValue(code)
		}

		effects.consume(code)
		return attriubteValueWithoutScope
	}

	function attriubteValueWithScope(code: Code) {
		if (latestMarker() === null || code === codes.eof || markdownLineEnding(code)) {
			markers = []
			return closeValue(code)
		}

		if (code === codes.rightCurlyBrace && latestMarker() === codes.leftCurlyBrace) {
			markers.pop()
		} else if (isQoute(code) && latestMarker() === code) {
			markers.pop()
		} else if (isQoute(code) || code === codes.leftCurlyBrace) {
			markers.push(code)
		}

		effects.consume(code)
		return attriubteValueWithScope
	}

	function closeValue(code: Code) {
		effects.exit('attributeValue')
		return closeSequence(code)
	}

	// --- class

	function attributeClass(code: Code) {
		if (isSequenceClosed(code)) {
			effects.exit('attributeClass')
			return closeSequence(code)
		}

		effects.consume(code)
		return attributeClass
	}

	// --- ID

	function attirbuteID(code: Code) {
		if (isSequenceClosed(code)) {
			effects.exit('attributeID')
			return closeSequence(code)
		}

		effects.consume(code)
		return attirbuteID
	}
}

// FromMarkdown extension to convert attribute tokens into MDAST nodes
export const attributeFromMarkdown: FromMarkdownExtension = {
	enter: {
		attribute: enterAttribute,
		attentionSequence: enterAttributeSequence
	},
	exit: {
		attentionSequence: exitAttributeSequence,
		attributeKey: exitAttributeKey,
		attributeValue: exitAttributeValue,
		attributeClass: exitAttributeClass,
		attributeID: exitAttributeID
	}
}

function enterAttribute(this: CompileContext) {
	this.data.attr = {}
}

function enterAttributeSequence(this: CompileContext) {
	this.data.store = {
		key: '',
		value: undefined
	}
}

function exitAttributeKey(this: CompileContext, token: Token) {
	const key = this.sliceSerialize(token)
	if (/[a-zA-Z][\w-@:]+/.test(key)) {
		this.data.store.key = key
	}
}

function exitAttributeValue(this: CompileContext, token: Token) {
	const value = this.sliceSerialize(token)
	if (value.at(0) === value.at(-1)) {
		this.data.store.value = value.replace(/^["']|['"]$/, '')
	} else {
		this.data.store.value = value.replace(/^["']$/, '')
	}
}

function exitAttributeClass(this: CompileContext, token: Token) {
	this.data.store.key = 'class'
	this.data.store.value = this.sliceSerialize(token).slice(1) || null
}

function exitAttributeID(this: CompileContext, token: Token) {
	this.data.store.key = 'id'
	this.data.store.value = this.sliceSerialize(token).slice(1) || null
}

function exitAttributeSequence(this: CompileContext) {
	const attr = this.data.attr
	const key = this.data.store.key
	const value = this.data.store.value || null

	if ((key === 'class' || key === 'id') && typeof value === 'string') {
		attr.class = typeof attr.class === 'string' ? [attr.class.trim(), value].join(' ') : value
	} else if (key) {
		attr[key] = value
	}
}
