import { describe, expect, test } from 'vitest';
import { clamp, hashToNumber, strToNumber } from './number';

describe('Test hashToNumber function', () => {
	test('should return 1 when hash is "#1"', () => {
		expect(hashToNumber('#1')).toBe(1);
	});
	test('should return 1 when hash is "#a"', () => {
		expect(hashToNumber('#a')).toBe(0);
	});
	test('should return 1 when hash is undefined', () => {
		expect(hashToNumber()).toBe(1);
	});
});

describe('Test strToNumber function', () => {
	test('should return 1 when str is "1"', () => {
		expect(strToNumber('1')).toBe(1);
	});
	test('should return 0 when str is "a"', () => {
		expect(strToNumber('a')).toBe(0);
	});
});

describe('Test clamp function', () => {
	test('should return 1 when value is 1, min is 0, max is 2', () => {
		expect(clamp(1, 0, 2)).toBe(1);
	});
	test('should return 0 when value is -1, min is 0, max is 2', () => {
		expect(clamp(-1, 0, 2)).toBe(0);
	});
	test('should return 2 when value is 3, min is 0, max is 2', () => {
		expect(clamp(3, 0, 2)).toBe(2);
	});
});
