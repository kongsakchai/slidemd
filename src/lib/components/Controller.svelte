<script lang="ts">
	import { goto } from '$app/navigation';
	import LeftArrow from '$lib/icons/LeftArrow.svelte';
	import RightArrow from '$lib/icons/RightArrow.svelte';
	import Scale from '$lib/icons/Scale.svelte';

	interface Props {
		count: number;
		current: number;
	}

	let { count, current }: Props = $props();

	const next = () => {
		if (current >= count) return;
		goto(`#${current + 1}`, { replaceState: true });
	};

	const prev = () => {
		if (current <= 1) return;
		goto(`#${current - 1}`, { replaceState: true });
	};

	const fullscreen = () => {
		const root = document.documentElement;
		if (!document.fullscreenElement) {
			root.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	$effect(() => {
		const keydown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') next();
			if (e.key === 'ArrowLeft') prev();
		};

		window.addEventListener('keydown', keydown);

		return () => {
			window.removeEventListener('keydown', keydown);
		};
	});
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

		<span class=" min-w-[60px] text-center text-sm">{current} of {count}</span>

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
