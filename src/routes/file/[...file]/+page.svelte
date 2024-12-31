<script lang="ts">
	import Slide from '$lib/components/Slide.svelte';

	let { data } = $props();
</script>

<Slide slide={data.slide} />
