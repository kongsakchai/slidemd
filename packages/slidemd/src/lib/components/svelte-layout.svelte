<script lang="ts">
	import { calPageSize } from '@lib/utils'

	import type { Snippet } from 'svelte'

	interface Props {
		children: Snippet
	}

	let { children }: Props = $props()

	let width = $state(0)
	let height = $state(0)

	let pageSize = $derived(calPageSize(1 / 1, width, height))
</script>

<section
	class="flex h-full w-full items-center justify-center bg-black"
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	<section class="bg-white" style:width="{pageSize.width}px" style:height="{pageSize.height}px">
		{@render children()}
	</section>
</section>
