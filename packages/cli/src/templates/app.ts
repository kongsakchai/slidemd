import { Template } from './types'

export const templateApp: Template = {
	id: '@slidemd/cli/app.svelte',
	getContent(this, options) {
		const contentStr = JSON.stringify(options.markdowns)

		const template = [
			`<script lang="ts">`,
			`const contents: string[] = ${contentStr}`,
			`</script>`,
			`<main class="h-full w-full p-6">`,
			`<h1>🚀 Slide MD</h1>`,
			`{#each contents as content}`,
			`<a href="/{content}">{content}</a>`,
			`{/each}`,
			`</main>`
		]

		return template.join('\n')
	}
}
