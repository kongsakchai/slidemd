import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, State, TokenizeContext } from 'micromark-util-types'

function blankLineTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		if (!markdownLineEnding(code)) {
			return nok(code)
		}

		effects.enter(types.lineEnding)
		effects.consume(code)
		effects.exit(types.lineEnding)

		return next
	}

	function next(code: Code) {
		if (!markdownSpace(code)) {
			return end(code)
		}

		effects.enter(types.linePrefix)
		return consumeSpace(code)
	}

	function consumeSpace(code: Code) {
		if (!markdownSpace(code)) {
			effects.exit(types.linePrefix)
			return end(code)
		}

		effects.consume(code)
		return consumeSpace
	}

	function end(code: Code) {
		return code === codes.eof || markdownLineEnding(code) ? ok(code) : nok(code)
	}
}

export const blankLinePartialTokenizer: Construct = { partial: true, tokenize: blankLineTokenize }

function nonLazyTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const isLazy = () => this.parser.lazy[this.now().line]

	return start

	function start(code: Code) {
		if (!markdownLineEnding(code)) {
			return nok(code)
		}

		effects.enter(types.lineEnding)
		effects.consume(code)
		effects.exit(types.lineEnding)

		return end
	}

	function end(code: Code) {
		return isLazy() ? nok(code) : ok(code)
	}
}

export const nonLazyPartialTokenizer: Construct = { partial: true, tokenize: nonLazyTokenize }
