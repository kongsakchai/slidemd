<script lang="ts">
	import { goto } from '$app/navigation';
	import LeftArrow from '$lib/icons/LeftArrow.svelte';
	import RightArrow from '$lib/icons/RightArrow.svelte';
	import Scale from '$lib/icons/Scale.svelte';

	import { slideStore } from '$lib/store/slide.svelte.js';

	const next = () => {
		slideStore.next();
		goto(`#${slideStore.page}`, { replaceState: true });
	};

	const prev = () => {
		slideStore.prev();
		goto(`#${slideStore.page}`, { replaceState: true });
	};

	const fullscreen = () => {
		const root = document.documentElement;
		if (!document.fullscreenElement) {
			root.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};
</script>

<div class="fixed bottom-0 left-0 w-full p-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
	<div
		class="flex w-fit items-center gap-2 rounded-lg border border-line bg-primary-bg p-2 text-secondary-text shadow-lg"
	>
		<button onclick={fullscreen}>
			<Scale />
		</button>

		<div class="vline"></div>

		<button onclick={prev}>
			<LeftArrow />
		</button>

		<div class="vline"></div>

		<span class=" min-w-[60px] text-center text-sm">{slideStore.toString()}</span>

		<div class="vline"></div>

		<button onclick={next}>
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
