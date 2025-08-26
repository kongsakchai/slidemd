<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		title: string
		list: any[]
		render: Snippet<[any]>
	}

	let { list, title, render }: Props = $props()
</script>

<p class=""><b>{title}</b></p>
<section class="grid grid-cols-3 gap-6 lg:grid-cols-6">
	{#each list as item}
		{@render render(item)}
	{/each}
</section>
