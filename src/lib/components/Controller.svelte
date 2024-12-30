<script lang="ts">
	import LeftArrow from '$lib/icons/LeftArrow.svelte';
	import RightArrow from '$lib/icons/RightArrow.svelte';

	import { slideStore } from '$lib/store/slide.svelte.js';
</script>

<div class="fixed bottom-4 left-4">
	<div class="flex items-center gap-2 rounded-lg border border-line bg-white p-2 text-secondary-text shadow-lg">
		<button onclick={slideStore.prev}>
			<LeftArrow />
		</button>

		<div class="vline"></div>

		<span class=" min-w-[60px] text-center text-sm">{slideStore.toString()}</span>

		<div class="vline"></div>

		<button onclick={slideStore.next}>
			<RightArrow />
		</button>
	</div>
</div>

<style>
	.vline {
		width: 1px;
		height: 28px;
		background-color: var(--line-color);
	}
</style>
