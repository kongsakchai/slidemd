import type { Code, Effects, TokenizeContext } from 'micromark-util-types'
import { describe, expect, it } from 'vitest'

import { blankLinePartialTokenizer } from '../../src/parsers/line'

describe('blank line', () => {
	it('should return nok when blank line is null', () => {
		let status = ''

		const ok = (code: Code) => {
			status = 'ok' + code
			return undefined
		}

		const nok = (code: Code) => {
			status = 'nok' + code
			return undefined
		}

		const start = blankLinePartialTokenizer.tokenize.call({} as TokenizeContext, {} as Effects, ok, nok)
		const file = start(null)
		expect(file).toBeUndefined()
		expect(status).toEqual('nok' + null)
	})
})
