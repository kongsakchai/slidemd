import { describe, expect, test } from 'vitest'
import { Clickable, parseClickValue, setClickable } from './clickable'

describe('parseClickValue', () => {
	test('should return empty object when clickValue is empty', () => {
		const result = parseClickValue('')
		expect(result).toEqual({})
	})

	test('should return click data object when clickValue is not empty', () => {
		const result = parseClickValue('0:class1,1:class2')
		expect(result).toEqual({
			0: ['class1'],
			1: ['class2']
		})
	})
})

/**
 * @vitest-environment jsdom
 */
describe('setCopyCodeButton', () => {
	test('should return clickables when click data correct', () => {
		const page = document.createElement('div')
		page.setAttribute('data-page', '2')
		document.body.appendChild(page)

		// case: incorrect page number
		const incorrectPage = document.createElement('div')
		incorrectPage.setAttribute('data-page', 'haha')
		document.body.appendChild(incorrectPage)

		for (let i = 0; i < 3; i++) {
			const click = document.createElement('div')
			click.setAttribute('click', '0:class1,1:class2')

			// case: empty click attribute
			if (i === 2) {
				click.setAttribute('click', '')
			}

			page.appendChild(click)
		}

		const clicks = setClickable(true)
		expect(Object.keys(clicks)).toEqual(['2'])
	})

	test('should return empty object when browser are false', () => {
		const clicks = setClickable(false)
		expect(clicks).toEqual({})
	})
})

/**
 * @vitest-environment jsdom
 */
describe('Clickable', () => {
	test('should add and remove classes on click', () => {
		const click = document.createElement('div')
		click.setAttribute('click', '1:class1,2:class2')

		const clickable = new Clickable(click)

		clickable.click(1)
		expect(click.classList.contains('class1')).toBe(true)
		expect(click.classList.contains('class2')).toBe(false)

		clickable.click(2)
		expect(click.classList.contains('class1')).toBe(false)
		expect(click.classList.contains('class2')).toBe(true)

		clickable.click(0)
		expect(click.classList.contains('class1')).toBe(false)
		expect(click.classList.contains('class2')).toBe(false)
	})
})
