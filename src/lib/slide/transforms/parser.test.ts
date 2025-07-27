import { describe, expect, test } from 'vitest'
import {
	join,
	parseAttributes,
	parseAxis,
	parseClass,
	parseDimensions,
	parseFilters,
	parseFit,
	parseId,
	parsePositionKey,
	parsePositions,
	parseRepeat,
	parseRepeatAxis,
	parseSplit,
	parseValueWithUnit
} from './parser'

test('should join an array of strings with a space', () => {
	const input = ['hello  ', '  world.  ']
	const result = join(input, ' ')
	expect(result).toBe('hello world.')
})

test('should return attributes from parseAttributes', () => {
	const input = 'attr1:value1 attr2:"value2" .hover:bg-red-500'
	const result = parseAttributes(input)
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
		const result = parseId(input, base)
		expect(result).toBe('base-id id-name')
	})

	test('should return id without base id when have id in string but no base id', () => {
		const input = 'some text #id-name'
		const result = parseId(input)
		expect(result).toBe('id-name')
	})

	test('should return base id when no id in string', () => {
		const input = 'some text without id'
		const base = 'base-id'
		const result = parseId(input, base)
		expect(result).toBe('base-id')
	})
})

describe('parseClass', () => {
	test('should return class with base class when have class in string', () => {
		const input = 'some text .class-name'
		const base = 'base-class'
		const result = parseClass(input, base)
		expect(result).toBe('base-class class-name')
	})

	test('should return class without base class when have class in string but no base class', () => {
		const input = 'some text .class-name'
		const result = parseClass(input)
		expect(result).toBe('class-name')
	})

	test('should return base class when no class in string', () => {
		const input = 'some text without class'
		const base = 'base-class'
		const result = parseClass(input, base)
		expect(result).toBe('base-class')
	})
})

describe('parseFilters', () => {
	test('should return blur brightness and contrast', () => {
		const input = 'blur:2px brightness:10 contrast'
		const result = parseFilters(input)
		expect(result).toEqual('blur(2px) brightness(10) contrast(2)')
	})

	test('should return empty string when no filters are found', () => {
		const input = 'no filters here'
		const result = parseFilters(input)
		expect(result).toEqual('')
	})
})

describe('parseFit', () => {
	test('should return cover from parseFit', () => {
		const input = 'some text cover contain'
		const result = parseFit(input)
		expect(result).toBe('contain')
	})

	test('should return empty string when no fit is found', () => {
		const input = 'some text without fit'
		const result = parseFit(input)
		expect(result).toBe('')
	})
})

test('should return dimensions from parseDimensions', () => {
	const input = 'w:100px h:200px x:50% y:50%'
	const result = parseDimensions(input)
	expect(result).toEqual({ w: '100px', h: '200px' })
})

test('should return axis from parseAxis', () => {
	const input = 'w:100px h:200px x:50% y:50%'
	const result = parseAxis(input)
	expect(result).toEqual({ x: '50%', y: '50%' })
})

describe('parsePositionKey', () => {
	test('should return position key from parsePositionKey', () => {
		const input = 'left top'
		const result = parsePositionKey(input)
		expect(result).toBe('top')
	})

	test('should return empty string when no position key is found', () => {
		const input = 'some text without position'
		const result = parsePositionKey(input)
		expect(result).toBe('')
	})
})

test('should return position from parsePosition', () => {
	const input = 'top:10px right:20px bottom:30px left:40px'
	const result = parsePositions(input)
	expect(result).toEqual({ top: '10px', right: '20px', bottom: '30px', left: '40px' })
})

describe('parseRepeat', () => {
	test('should return repeat key from parseRepeat', () => {
		const input = 'repeat no-repeat '
		const result = parseRepeat(input)
		expect(result).toEqual('no-repeat')
	})

	test('should return empty string when no repeat key is found', () => {
		const input = 'some text'
		const result = parseRepeat(input)
		expect(result).toEqual('')
	})
})

test('should return repeat axis from parseRepeatAxis', () => {
	const input = 'repeat-x:no-repeat repeat-y:space'
	const result = parseRepeatAxis(input)
	expect(result).toEqual({ 'repeat-x': 'no-repeat', 'repeat-y': 'space' })
})

describe('parseValueWithUnit', () => {
	test('should return value with unit from parseValueWithUnit', () => {
		const input = 'some text 100px 200pt'
		const result = parseValueWithUnit(input)
		expect(result).toEqual('200pt')
	})

	test('should return empty string when no value with unit is found', () => {
		const input = 'some text without value'
		const result = parseValueWithUnit(input)
		expect(result).toEqual('')
	})
})

describe('parseSplit', () => {
	test('should return split value from parseSplit', () => {
		const input = 'split:100px'
		const result = parseSplit(input)
		expect(result).toEqual('100px')
	})

	test('should return empty string when no split is found', () => {
		const input = 'some text without split'
		const result = parseSplit(input)
		expect(result).toEqual('')
	})
})
