<script lang="ts">
	import ArrowLeft from '@/lib/icons/ArrowLeft.svelte';
	import ArrowRight from '@/lib/icons/ArrowRight.svelte';
	import FullScreen from '@/lib/icons/FullScreen.svelte';
	import NonFullScreen from '@/lib/icons/NonFullScreen.svelte';

	interface Props {
		page?: number;
		maxPage?: number;
		prevpage: () => void;
		nextpage: () => void;
	}

	let { page = 0, maxPage = 0, nextpage, prevpage }: Props = $props();
	let fullScreen = $state<boolean>(false);

	const handleNextPage = () => page < maxPage && nextpage();
	const handlePrevPage = () => page > 1 && prevpage();
	const handleToggleFullScreen = () => (fullScreen ? document.exitFullscreen() : document.body.requestFullscreen());

	$effect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') handlePrevPage();
			if (e.key === 'ArrowRight') handleNextPage();
		};

		window.addEventListener('keydown', handleKeydown);

		const handleFullScreenChange = () => {
			fullScreen = document.fullscreenElement !== null;
		};

		document.body.addEventListener('fullscreenchange', handleFullScreenChange);

		return () => {
			window.removeEventListener('keydown', handleKeydown);
			document.body.removeEventListener('fullscreenchange', handleFullScreenChange);
		};
	});
</script>

<div class="container">
	<button class=" border-r" onclick={handleToggleFullScreen}>
		{#if !fullScreen}
			<FullScreen width="32px" height="32px" />
		{:else}
			<NonFullScreen width="32px" height="32px" />
		{/if}
	</button>
	<button class=" border-r" onclick={handlePrevPage}>
		<ArrowLeft width="32px" height="32px" />
	</button>
	<span class="border-r w-[100px] text-center select-none">{page} of {maxPage}</span>
	<button class=" border-r" onclick={handleNextPage}>
		<ArrowRight width="32px" height="32px" />
	</button>
</div>

<style>
	.container {
		background-color: white;
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		align-items: center;
		padding: 0.5em 0;
		border-radius: 8px;
		width: fit-content;
		border: 1px solid var(--divider-color);
	}

	.container > * {
		padding-left: 8px;
		padding-right: 8px;
	}
</style>
