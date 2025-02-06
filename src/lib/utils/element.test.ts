import { describe, expect, test } from 'vitest';
import { byId } from './element';

// TODO: Find a way to test this function
describe('byId', () => {
	test('should return an element', () => {
		const element = byId('root');
		expect(element).toBeNull();
	});
});
