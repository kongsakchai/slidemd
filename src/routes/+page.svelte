<script lang="ts">
	let { data } = $props();
</script>

{#each data.pages as page}
	<section>{@html page}</section>
{/each}
