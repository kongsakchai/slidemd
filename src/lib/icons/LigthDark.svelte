<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		dark: boolean;
	}

	let { dark }: Props = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	{#if dark}
		<path
			in:fly={{ duration: 200, y: 10, opacity: 0 }}
			out:fly={{ duration: 200, y: -10, opacity: 0 }}
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			d="M3 11.507a9.493 9.493 0 0 0 18 4.219c-8.507 0-12.726-4.22-12.726-12.726A9.49 9.49 0 0 0 3 11.507"
		/>
	{:else}
		<path
			in:fly={{ duration: 200, y: 10, opacity: 0 }}
			out:fly={{ duration: 200, y: -10, opacity: 0 }}
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			d="M12 18a6 6 0 1 0 0-12a6 6 0 0 0 0 12m10-6h1M12 2V1m0 22v-1m8-2l-1-1m1-15l-1 1M4 20l1-1M4 4l1 1m-4 7h1"
		/>
	{/if}
</svg>
