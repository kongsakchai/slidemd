import { Template } from './types'

export const templateSlideLayout: Template = {
	id: '@slidemd/cli/slide.svelte',
	getContent(options) {
		const template = [
			`<script lang="ts">`,
			`import Slide,{slide,data} from '${options.getSlideId(this.id)}'`,
			`import '@slidemd/slidemd/themes/default'`,
			`let currentPage = $state(1)`,
			`</script>`,
			`<main class="h-fullsw-full p-6">`,
			`<Slide {currentPage} />`,
			`</main>`
		]

		return template.join('\n')
	}
}

export const templateSlide: Template = {
	id: '@slidemd/cli/slide.slide',
	getContent(options) {
		return options.read(this.id)
	}
}
