import { test } from 'vitest'

export type Testcase = { title: string; value: string; expected: string }

export function runTest(testcase: Testcase[], index: 'all' | number, testFn: (testcase: Testcase) => Promise<void>) {
	for (let i = 0; i < testcase.length; i++) {
		if (index !== 'all' && i !== index) {
			continue
		}

		test(testcase[i].title, async () => {
			await testFn(testcase[i])
		})
	}
}
