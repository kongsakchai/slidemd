// packages/parse/vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		name: '@decko/parser',
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: ['src/global.d.ts', 'src/index.ts'],
			thresholds: {
				perFile: true,
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			},
			reporter: ['text', 'text-summary', 'html']
		}
	}
})
