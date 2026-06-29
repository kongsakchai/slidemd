import { markdownLineEnding, markdownSpace } from 'micromark-util-character'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, State, TokenizeContext } from 'micromark-util-types'

// Tokenize

export const partialBlankLineTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
		function start(code: Code) {
			if (!markdownLineEnding(code)) return nok(code)
			effects.enter(types.lineEnding)
			effects.consume(code)
			effects.exit(types.lineEnding)
			return afterLineEnding
		}

		function afterLineEnding(code: Code) {
			if (!markdownSpace(code)) return end(code)
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

		return start
	}
}

export const nonLazyPartialTokenizer: Construct = {
	partial: true,
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
		const isLazy = () => this.parser.lazy[this.now().line]

		function start(code: Code) {
			if (!markdownLineEnding(code)) return nok(code)
			effects.enter(types.lineEnding)
			effects.consume(code)
			effects.exit(types.lineEnding)
			return afterLineEnding
		}

		function afterLineEnding(code: Code) {
			return isLazy() ? nok(code) : ok(code)
		}

		return start
	}
}
