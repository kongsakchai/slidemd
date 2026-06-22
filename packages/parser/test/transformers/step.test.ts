/* eslint-disable @typescript-eslint/no-explicit-any */
import { VFile } from 'vfile'
import { describe, expect, it } from 'vitest'

import { stepTransformer } from '../../src/transformers/step'

describe('step', () => {
	it('should return max step', () => {
		const tree = {
			type: 'root',
			children: [
				{
					type: 'text',
					value: 'hello',
					data: {
						hProperties: {
							'step-1': 'bg-red-500',
							'step-2': 'bg-blue-500',
							class: 'bg-white'
						}
					}
				},
				{
					type: 'text',
					value: 'markdown',
					data: {
						hProperties: {}
					}
				}
			]
		}
		const vfile = new VFile()

		const transformer = stepTransformer()
		transformer(tree, vfile, null as any)

		expect(vfile.data.step).toEqual(2)
	})
})
