<script lang="ts">
	import { browser } from '$app/environment';
	import Dark from '$lib/icons/Dark.svelte';
	import Light from '$lib/icons/Light.svelte';

	let theme = $state('');

	if (browser) {
		theme = localStorage.getItem('slidemd:theme') || 'light';
	}

	const toggleDark = () => {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('slidemd:theme', theme);
	};
</script>

<button class="fixed right-4 top-4 text-secondary-text opacity-50" onclick={toggleDark}>
	{#if theme === 'light'}
		<Light />
	{:else}
		<Dark />
	{/if}
</button>
