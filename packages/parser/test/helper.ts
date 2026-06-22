import { test } from 'vitest'

export type Parse = (str: string) => Promise<string>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Testcase = { title: string; value: string; expected: any }

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
