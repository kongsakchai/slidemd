import { defineConfig } from 'tsdown'

import baseConfig from '../../tsdown.config.ts'

export default defineConfig({
	...baseConfig,
	entry: ['./src/index.ts'],
	deps: {
		// onlyBundle: ['@types/unist','']
		neverBundle: [
			'micromark-util-character',
			'micromark-util-classify-character',
			'micromark-util-html-tag-name',
			'micromark-util-resolve-all',
			'micromark-util-symbol',
			/@types/
		]
	}
})
