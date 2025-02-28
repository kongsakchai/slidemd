<script lang="ts">
	import LeftArrow from '$lib/icons/LeftArrow.svelte';
	import RightArrow from '$lib/icons/RightArrow.svelte';
	import Scale from '$lib/icons/Scale.svelte';

	interface Props {
		total: number;
		current: number;
		onnext: () => void;
		onprev: () => void;
	}

	let { total: count, current, onnext, onprev }: Props = $props();

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
			if (e.key === 'ArrowRight') onnext();
			if (e.key === 'ArrowLeft') onprev();
		};

		window.addEventListener('keydown', keydown);

		return () => {
			window.removeEventListener('keydown', keydown);
		};
	});
</script>

<div class="fixed bottom-0 left-0 w-full p-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
	<div
		class="border-line bg-controller text-controller-text flex w-fit items-center gap-2 rounded-lg border p-2 shadow-lg"
	>
		<button onclick={fullscreen}>
			<Scale />
		</button>

		<div class="vline"></div>

		<button onclick={onprev}>
			<LeftArrow />
		</button>

		<div class="vline"></div>

		<span class=" min-w-[60px] text-center text-sm">{current} of {count}</span>

		<div class="vline"></div>

		<button onclick={onnext}>
			<RightArrow />
		</button>
	</div>
</div>

<style lang="postcss">
	.vline {
		width: 1px;
		height: 28px;
		background-color: var(--color-line);
	}
</style>
