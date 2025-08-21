import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { setCopyCodeButton } from './copy-code'

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
