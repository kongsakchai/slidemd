import { asciiAlpha, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { nonLazyPartialTokenizer } from './line.js'

const NUMBER_SIGN_BLOCK = new Set(['if', 'each', 'key', 'await', 'snippet'])
const COLON_BLOCK = new Set(['else', 'then', 'catch', 'final'])
const SLASH_BLOCK = new Set(['if', 'each', 'await', 'key', 'snippet'])
const AT_SIGN_BLOCK = new Set(['render', 'html', 'const', 'debug'])

const PREFIX_MAPPING: { [key: number]: Set<string> } = {
	[codes.numberSign]: NUMBER_SIGN_BLOCK,
	[codes.colon]: COLON_BLOCK,
	[codes.slash]: SLASH_BLOCK,
	[codes.atSign]: AT_SIGN_BLOCK
}

// --- Tokenizer

const svelteBlockTokenizer: Construct = {
	name: 'logic-block',
	tokenize: tokenize,
	concrete: true
}

export const svelteBlock: Extension = {
	flow: {
		[codes.leftCurlyBrace]: svelteBlockTokenizer
	}
}

// --- Tokenize

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let tagNameBuffer: number[] = []
	let tagSet: Set<string> | null = null

	const isInterrupt = () => this.interrupt

	return start

	function start(code: Code): State | undefined {
		effects.enter(types.htmlFlow)
		effects.enter(types.htmlFlowData)
		effects.consume(code) // consume `{`
		return open
	}

	function open(code: Code) {
		if (code === null || markdownLineEnding(code)) {
			return nok(code)
		}

		tagSet = PREFIX_MAPPING[code]
		tagNameBuffer = []

		effects.consume(code)
		return blockName
	}

	function blockName(code: Code) {
		if (code != null && asciiAlpha(code)) {
			tagNameBuffer.push(code)
			effects.consume(code)
			return blockName
		}

		if (markdownLineEndingOrSpace(code) || code === codes.rightCurlyBrace) {
			return endBlockName(code)
		}

		return nok(code)
	}

	function endBlockName(code: Code) {
		const name = String.fromCodePoint(...tagNameBuffer).toLowerCase()

		if (tagSet?.has(name)) {
			return isInterrupt() ? ok(code) : more(code)
		}

		return nok(code)
	}

	function more(code: Code) {
		if (code === codes.rightCurlyBrace) {
			effects.consume(code)
			return beforeEnd
		}

		if (markdownLineEnding(code)) {
			effects.exit(types.htmlFlowData)
			return checkNonLazy(code)
		}

		effects.consume(code)
		return more
	}

	function beforeEnd(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit(types.htmlFlowData)
			return done(code)
		}

		effects.consume(code)
		return beforeEnd
	}

	function done(code: Code) {
		effects.exit(types.htmlFlow)
		return ok(code)
	}

	// check non lazy line
	// non lazy: continua
	// lazy: done
	function checkNonLazy(code: Code) {
		return effects.attempt(nonLazyPartialTokenizer, checkNextLine, done)(code)
	}

	function checkNextLine(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			return checkNonLazy(code)
		}

		effects.enter(types.htmlFlowData)
		return more(code)
	}
}
