import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	assetsInclude: ['contetns/**/*.md'],
	server: {
		watch: {
			followSymlinks: true
		}
	},
	resolve: {
		preserveSymlinks: true
	}
});
