import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { attribute } from './attribute.js'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
export const attributeBlockTokenizer: Construct = {
	name: 'attributeBlock',
	tokenize: tokenize,
	concrete: true
}

export const attributeBlock: Extension = {
	text: {
		[codes.atSign]: attributeBlockTokenizer
	}
}

const attributePartialTokenizer: Construct = { partial: true, tokenize: attributeTokenize }

function attributeTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return attribute(effects, ok, nok, codes.rightCurlyBrace)
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		effects.enter('attributeBlock')
		effects.enter('attributeBlockSequence')
		effects.consume(code)
		return open
	}

	function open(code: Code) {
		if (code === codes.leftCurlyBrace) {
			effects.consume(code)
			effects.exit('attributeBlockSequence')
			return more
		}

		return nok(code)
	}

	function more(code: Code) {
		return effects.attempt(attributePartialTokenizer, beforeDone, beforeDone)(code)
	}

	function beforeDone(code: Code) {
		if (code === codes.rightCurlyBrace) {
			effects.enter('attributeBlockSequence')
			effects.consume(code)
			effects.exit('attributeBlockSequence')
			return done
		}

		return nok(code)
	}

	function done(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit('attributeBlock')
			return ok(code)
		}
		return nok(code)
	}
}

// FromMarkdown extension to convert attribute tokens into MDAST nodes
export const attributeBlockFromMarkdown: FromMarkdownExtension = {
	enter: { attributeBlock: enterToken },
	exit: { attributeBlock: exitToken }
}

function enterToken(this: CompileContext, token: Token) {
	this.data.attr = {}
	this.enter(
		{
			type: 'attributeBlock',
			value: '',
			attr: {}
		},
		token
	)
}

function exitToken(this: CompileContext, token: Token) {
	const node = this.stack.at(-1)
	if (node?.type === 'attributeBlock') {
		node.attr = this.data.attr
	}
	this.exit(token)
}
