<script lang="ts">
	import { State, useSlideContext } from '@slidemd/slidemd/state'

	const slideContext = useSlideContext()

	function nextPage() {
		slideContext.update(State.NEXT)
	}

	function previousPage() {
		slideContext.update(State.PREVIOUS)
	}
</script>

<div class="menu">
	<button onclick={previousPage} title="previous button" class="menu-btn rounded-l-sm">
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
	<button title="paginate button">
		<p class="text-card-foreground m-0 min-w-21 px-2 text-center text-sm font-medium tabular-nums">
			{slideContext.page} / {slideContext.totalPage}
		</p>
	</button>
	<div class=" border-border border-l"></div>
	<button onclick={nextPage} title="next button" class="menu-btn rounded-r-sm">
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
