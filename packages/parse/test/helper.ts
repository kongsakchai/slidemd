import { it } from 'vitest'

export type Testcase = { title: string; value: string; expected: string }

export function runTest(testcase: Testcase[], index: 'all' | number, test: (testcase: Testcase) => Promise<void>) {
	for (let i = 0; i < testcase.length; i++) {
		if (index !== 'all' && i !== index) {
			continue
		}

		it(testcase[i].title, async () => {
			await test(testcase[i])
		})
	}
}
