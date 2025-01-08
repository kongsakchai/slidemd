import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}', './contents/**/*.md'],

	theme: {
		extend: {
			colors: {
				'primary-bg': 'var(--primary-bg-color)',
				'primary-text': 'var(--primary-text-color)',
				'secondary-text': 'var(--secondary-text-color)',
				line: 'var(--line-color)',
				'action-text': 'var(--action-text-color)'
			}
		}
	},

	plugins: []
} satisfies Config;
