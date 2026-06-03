import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { markdownLineEnding } from 'micromark-util-character'
import { codes } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
export const attributeTokenizer: Construct = {
	name: 'html',
	tokenize: tokenize,
	concrete: true
}

export const attribute: Extension = {
	text: {
		[codes.atSign]: attributeTokenizer
	}
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		effects.enter('attribute')
		effects.consume(code)
		return open
	}

	function open(code: Code) {
		if (code === codes.leftCurlyBrace) {
			effects.consume(code)
			return more
		}

		return nok(code)
	}

	function more(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			return nok(code)
		}

		if (code === codes.rightCurlyBrace) {
			effects.consume(code)
			return end
		}

		effects.consume(code)
		return more
	}

	function end(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit('attribute')
			return ok(code)
		}
		return nok(code)
	}
}

// FromMarkdown extension to convert attribute tokens into MDAST nodes
export const attributeFromMarkdown: FromMarkdownExtension = {
	canContainEols: ['attribute'],
	enter: { attribute: enterToken },
	exit: { attribute: exitToken }
}

function enterToken(this: CompileContext, token: Token) {
	this.enter(
		{
			type: 'attribute',
			value: '',
			data: this.sliceSerialize(token).slice(2, -1)
		},
		token
	)
}

function exitToken(this: CompileContext, token: Token) {
	this.exit(token)
}
