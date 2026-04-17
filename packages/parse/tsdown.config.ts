import { defineConfig } from 'tsdown'

import baseConfig from '../../tsdown.config.ts'

export default defineConfig({
	...baseConfig,
	entry: ['./src/index.ts'],
	deps: {
		neverBundle: ['micromark-util-symbol', 'micromark-util-resolve-all']
	}
})
