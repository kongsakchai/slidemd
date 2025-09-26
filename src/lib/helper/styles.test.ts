import type { Directive } from '$lib/slidemd/types'
import { describe, expect, test } from 'vitest'
import { directiveToStyle } from './styles'

describe('directiveToStyle', () => {
	test('should return empty string when directive is undefined', () => {
		const result = directiveToStyle(undefined)
		expect(result).toBe('')
	})

	test('should return styles when have directive is not empty', () => {
		const directive = {
			style: 'color: red',
			bgImg: "'image1.png','image2.png'",
			bgColor: 'yellow',
			bgSize: 'cover',
			bgPosition: 'center',
			bgRepeat: 'no-repeat',
			splitDir: 'horizontal'
		} as Directive

		const result = directiveToStyle(directive, true)
		expect(result).toBe(
			"color: red; background-image: url('image1.png'), url('image2.png'); background-color: yellow; background-size: cover; background-position: center; background-repeat: no-repeat; --split-col: var(--split-size)"
		)
	})

	test('should return vertical', () => {
		const directive = {
			splitDir: 'vertical'
		} as Directive

		const result = directiveToStyle(directive, true)
		expect(result).toBe('--split-row: var(--split-size)')
	})
})
