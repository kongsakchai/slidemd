<svelte:options
	customElement={{
		tag: 'my-counter',
		shadow: 'none'
	}}
/>

<script lang="ts">
	let data = $state(0)
</script>

<div class="flex flex-row items-center gap-3">
	<button onclick={() => data--} class="border-line bg-primary h-fit w-12 rounded-sm border p-1"> - </button>
	<p class="font-bold">{data}</p>
	<button onclick={() => data++} class="border-line bg-primary h-fit w-12 rounded-sm border p-1"> + </button>
</div>
