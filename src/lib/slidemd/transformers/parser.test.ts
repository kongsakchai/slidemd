import { describe, expect, test } from 'vitest'
import { join, Parser } from './parser'

test('should join an array of strings with a space', () => {
	const input = ['hello  ', '  world.  ']
	const result = join(input, ' ')
	expect(result).toBe('hello world.')
})

test('should return attributes from parseAttributes', () => {
	const input = 'attr1:value1 attr2:"value2" .hover:bg-red-500'
	const result = new Parser(input).parseAttributes()
	const expected = {
		attr1: 'value1',
		attr2: 'value2'
	}
	expect(result).toEqual(expected)
})

describe('parseId', () => {
	test('should return id with base id when have id in string', () => {
		const input = 'some text #id-name'
		const base = 'base-id'
		const result = new Parser(input).parseId(base)
		expect(result).toBe('base-id id-name')
	})

	test('should return id without base id when have id in string but no base id', () => {
		const input = 'some text #id-name'
		const result = new Parser(input).parseId()
		expect(result).toBe('id-name')
	})

	test('should return base id when no id in string', () => {
		const input = 'some text without id'
		const base = 'base-id'
		const result = new Parser(input).parseId(base)
		expect(result).toBe('base-id')
	})
})

describe('parseClass', () => {
	test('should return class with base class when have class in string', () => {
		const input = 'some text .class-name'
		const base = 'base-class'
		const result = new Parser(input).parseClass(base)
		expect(result).toBe('base-class class-name')
	})

	test('should return class without base class when have class in string but no base class', () => {
		const input = 'some text .class-name'
		const result = new Parser(input).parseClass()
		expect(result).toBe('class-name')
	})

	test('should return base class when no class in string', () => {
		const input = 'some text without class'
		const base = 'base-class'
		const result = new Parser(input).parseClass(base)
		expect(result).toBe('base-class')
	})
})

describe('parseFilters', () => {
	test('should return blur brightness and contrast', () => {
		const input = 'blur:2px brightness:10 contrast'
		const result = new Parser(input).parseFilters()
		expect(result).toEqual('blur(2px) brightness(10) contrast(2)')
	})

	test('should return empty string when no filters are found', () => {
		const input = 'no filters here'
		const result = new Parser(input).parseFilters()
		expect(result).toEqual('')
	})
})

describe('parseFit', () => {
	test('should return cover from parseFit', () => {
		const input = 'some text cover contain'
		const result = new Parser(input).parseFit()
		expect(result).toBe('contain')
	})

	test('should return empty string when no fit is found', () => {
		const input = 'some text without fit'
		const result = new Parser(input).parseFit()
		expect(result).toBe('')
	})
})

test('should return dimensions from parseDimensions', () => {
	const input = 'w:100px h:200px x:50% y:50%'
	const result = new Parser(input).parseDimensions()
	expect(result).toEqual({ w: '100px', h: '200px' })
})

test('should return axis from parseAxis', () => {
	const input = 'w:100px h:200px x:50% y:50%'
	const result = new Parser(input).parseAxis()
	expect(result).toEqual({ x: '50%', y: '50%' })
})

describe('parsePositionKey', () => {
	test('should return position key from parsePositionKey', () => {
		const input = 'left top'
		const result = new Parser(input).parsePositionKey()
		expect(result).toBe('top')
	})

	test('should return empty string when no position key is found', () => {
		const input = 'some text without position'
		const result = new Parser(input).parsePositionKey()
		expect(result).toBe('')
	})
})

test('should return position from parsePosition', () => {
	const input = 'top:10px right:20px bottom:30px left:40px'
	const result = new Parser(input).parsePositions()
	expect(result).toEqual({ top: '10px', right: '20px', bottom: '30px', left: '40px' })
})

describe('parseRepeat', () => {
	test('should return repeat key from parseRepeat', () => {
		const input = 'repeat no-repeat '
		const result = new Parser(input).parseRepeat()
		expect(result).toEqual('no-repeat')
	})

	test('should return empty string when no repeat key is found', () => {
		const input = 'some text'
		const result = new Parser(input).parseRepeat()
		expect(result).toEqual('')
	})
})

test('should return repeat axis from parseRepeatAxis', () => {
	const input = 'repeat-x:no-repeat repeat-y:space'
	const result = new Parser(input).parseRepeatAxis()
	expect(result).toEqual({ 'repeat-x': 'no-repeat', 'repeat-y': 'space' })
})

describe('parseValueWithUnit', () => {
	test('should return value with unit from parseValueWithUnit', () => {
		const input = 'some text 100px 200pt'
		const result = new Parser(input).parseValueWithUnit()
		expect(result).toEqual('200pt')
	})

	test('should return empty string when no value with unit is found', () => {
		const input = 'some text without value'
		const result = new Parser(input).parseValueWithUnit()
		expect(result).toEqual('')
	})
})

describe('parseSplit', () => {
	test('should return split value from parseSplit', () => {
		const input = '<!-- split:100px -->'
		const result = new Parser(input).parseSplit()
		expect(result).toEqual('100px')
	})

	test('should return empty string when no split is found', () => {
		const input = 'some text without split'
		const result = new Parser(input).parseSplit()
		expect(result).toEqual('')
	})
})

describe('parseClick', () => {
	test('should return click data from parseClick', () => {
		const input = '0:.class1 0:.class2 1:.class3'
		const result = new Parser(input).parseClick()
		expect(result).toEqual({ 0: '.class1 .class2', 1: '.class3' })
	})

	test('should return empty object when no click data is found', () => {
		const input = 'some text without click data'
		const result = new Parser(input).parseClick()
		expect(result).toEqual({})
	})
})
