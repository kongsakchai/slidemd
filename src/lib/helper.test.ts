import { describe, expect, test } from 'vitest'
import { directiveToStyle } from './helper'
import type { Directive } from './types'

describe('directiveToStyle', () => {
	test('should return empty string when directive is undefined', () => {
		const result = directiveToStyle(undefined)
		expect(result).toBe('')
	})

	test('should return styles when have directive is not empty', () => {
		const directive = {
			style: 'color: red',
			color: 'blue',
			bgImg: "'image1.png','image2.png'",
			bgColor: 'yellow',
			bgSize: 'cover',
			bgPosition: 'center',
			bgRepeat: 'no-repeat',
			split: true,
			splitDir: 'horizontal',
			splitSize: '50%'
		} as Directive

		const result = directiveToStyle(directive)
		expect(result).toBe(
			"color: red; color: blue; background-image: url('image1.png'), url('image2.png'); background-color: yellow; background-size: cover; background-position: center; background-repeat: no-repeat; --split-col: 50%"
		)
	})

	test('should return vertical', () => {
		const directive = {
			split: true,
			splitDir: 'vertical',
			splitSize: '50%'
		} as Directive

		const result = directiveToStyle(directive)
		expect(result).toBe('--split-row: 50%')
	})
})
