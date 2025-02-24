import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	assetsInclude: ['contetns/**/*.md'],
	resolve: {
		preserveSymlinks: true,
		conditions: process.env.VITEST ? ['browser'] : []
	},
	test: {
		environment: 'happy-dom'
	}
});
