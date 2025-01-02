<script lang="ts">
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<ThemeSwitch />

{@render children()}
