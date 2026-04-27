<script lang="ts">
	import { PageState } from '@lib/utils'

	import Navigator from './navigator.svelte'
	import Viewer from './viewer.svelte'

	interface Props {
		state: PageState
	}

	let { state }: Props = $props()
</script>

<div class="controller absolute bottom-10 left-10 flex gap-4">
	<Navigator {state} />
	<Viewer />
</div>

<style lang="postcss">
	@reference "tailwindcss";
	@reference "@lib/themes/slidemd.css";

	.controller :global {
		.menu {
			@apply bg-card border-border text-card-foreground flex gap-0.5 rounded-md border p-0.5 shadow-2xl;
		}
		.menu-btn {
			@apply hover:bg-accent hover:text-accent-foreground content-center;
		}
	}
</style>
