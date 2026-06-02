import { markdownSpace } from 'micromark-util-character'
import { types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, State, TokenizeContext } from 'micromark-util-types'

function spaceTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		if (!markdownSpace(code)) {
			return nok(code)
		}

		effects.enter(types.linePrefix)
		return consumeSpace(code)
	}

	function consumeSpace(code: Code) {
		if (!markdownSpace(code)) {
			effects.exit(types.linePrefix)
			return ok(code)
		}

		effects.consume(code)
		return consumeSpace
	}
}

export const spacePartialTokenizer: Construct = { partial: true, tokenize: spaceTokenize }
