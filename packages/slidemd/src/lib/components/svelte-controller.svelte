<script lang="ts">
	import type { SlideData } from '@lib/types'
	import { PageAction, updatePageState } from '@lib/utils'

	interface Props {
		page: number
		step: number
		slide: SlideData
	}

	let { page = $bindable(1), step = $bindable(0), slide }: Props = $props()

	console.log(slide)

	function next() {
		const state = updatePageState(PageAction.NEXT, page, step, slide.pages.length, slide.pages[page - 1].step)
		page = state.page
		step = state.step

		console.log(page, step)
	}
</script>

<div class="absolute bottom-10 left-10 bg-red-500">
	<button onclick={next}>Next</button>
</div>
