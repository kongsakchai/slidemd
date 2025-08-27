<svelte:options
	customElement={{
		tag: 'my-btn'
	}}
/>

<script lang="ts">
	let data = $state(0)
</script>

<button onclick={() => data++} class=" bg-red-300 text-black">
	{data}
</button>
