import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { directiveToStyle, setCopyCodeButton } from './helper'
import type { Directive } from './types'

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
			split: true,
			splitDir: 'vertical'
		} as Directive

		const result = directiveToStyle(directive)
		expect(result).toBe('--split-row: var(--split-size)')
	})
})

/**
 * @vitest-environment jsdom
 */
describe('setCopyCodeButton', () => {
	let originalClipboard: Clipboard

	beforeEach(() => {
		originalClipboard = navigator.clipboard
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: vi.fn()
			},
			configurable: true
		})
	})

	afterEach(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: originalClipboard
		})
	})

	test('should not set copy code button when isBrowser is false', () => {
		const isBrowser = false
		const result = setCopyCodeButton(isBrowser)
		expect(result).toBeFalsy()
	})

	test('should not set copy code button when no pre', () => {
		const isBrowser = true
		const button = document.createElement('button')
		button.classList.add('copy')
		document.body.appendChild(button)

		const result = setCopyCodeButton(isBrowser)
		expect(result).toBeTruthy()

		button.click()
		expect(button.classList.contains('copied')).toBe(false)
	})

	test('should set copy code button when isBrowser is true', async () => {
		const isBrowser = true
		const button = document.createElement('button')
		button.classList.add('copy')
		document.body.appendChild(button)

		const pre = document.createElement('pre')
		pre.innerText = 'console.log("Hello, World!");'
		document.body.appendChild(pre)

		const result = setCopyCodeButton(isBrowser)
		expect(result).toBeTruthy()

		button.click()
		expect(button.classList.contains('copied')).toBe(true)

		await new Promise((resolve) => setTimeout(resolve, 1000))

		expect(button.classList.contains('copied')).toBe(false)
	})
})
