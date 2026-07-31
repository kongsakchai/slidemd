import { VirtualModule } from './types'

export const virtualSlides: VirtualModule = {
	id: '@slide:slides.svelte',
	content() {
		const markdowns = [...this.markdowns]
		return [
			`<script lang="ts">`,
			`const contents: string[] = ${JSON.stringify(markdowns)}`,
			`</script>`,
			`<main class="h-full w-full p-6">`,
			`<ul class="flex flex-col gap-2">`,
			`{#each contents as content}`,
			`<li><a class="text-blue-500 underline" href="/{content}">{content}</a></li>`,
			`{/each}`,
			`</ul>`,
			`</main>`
		].join('\n')
	}
}
