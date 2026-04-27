<script lang="ts">
	import { PageAction, PageState } from '@lib/utils'

	interface Props {
		state: PageState
	}

	let { state }: Props = $props()

	function nextPage() {
		state.update(PageAction.NEXT)
	}

	function previousPage() {
		state.update(PageAction.PREVIOUS)
	}
</script>

<div class="menu">
	<button onclick={previousPage} title="previous button" class="menu-btn h-9 w-9 rounded-l-sm">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="mx-auto"
		>
			<path d="m15 18-6-6 6-6" />
		</svg>
	</button>
	<div class=" border-border border-l"></div>
	<button>
		<p class="m-0 w-22 px-2 text-center font-medium tabular-nums">{state.page} / {state.maxPage}</p>
	</button>
	<div class=" border-border border-l"></div>
	<button onclick={nextPage} title="next button" class="menu-btn h-9 w-9 rounded-r-sm">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="mx-auto"
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	</button>
</div>
