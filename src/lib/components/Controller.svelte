<script lang="ts">
	import LeftArrow from '$lib/icons/LeftArrow.svelte';
	import RightArrow from '$lib/icons/RightArrow.svelte';

	interface Props {
		page?: number;
		pageCount?: number;
	}

	let { page = $bindable(1), pageCount = 1 }: Props = $props();

	const handleNexPage = () => {
		if (page < pageCount) page++;
	};
	const handlePrevPage = () => {
		if (page > 1) page--;
	};
</script>

<div class="fixed bottom-4 left-4">
	<div class="flex items-center gap-2 rounded-lg border border-line bg-white p-2 text-secondary-text shadow-lg">
		<button class="btn btn-sm" onclick={handlePrevPage}>
			<LeftArrow />
		</button>

		<div class="vline"></div>

		<span class=" min-w-[60px] text-center text-sm">{page} of {pageCount}</span>

		<div class="vline"></div>

		<button class="btn btn-sm" onclick={handleNexPage}>
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
