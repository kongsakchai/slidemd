/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'

import { asString } from '../src/utils'

describe('utils', () => {
	it('should return string when value is string', () => {
		const val: string | undefined = 'test'
		const resp = asString(val)
		expect(resp).toEqual('test')
	})

	it('should return default value when value is not string', () => {
		const val: string | undefined = undefined
		const resp = asString(val, 'test')
		expect(resp).toEqual('test')
	})
})
