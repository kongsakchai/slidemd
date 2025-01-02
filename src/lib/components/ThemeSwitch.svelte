<script lang="ts">
	import { browser } from '$app/environment';
	import Dark from '$lib/icons/Dark.svelte';
	import Light from '$lib/icons/Light.svelte';
	import { backInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	let theme = $state('');

	if (browser) {
		theme = localStorage.getItem('slidemd:theme') || 'light';
	}

	const toggleDark = () => {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', theme === 'dark');
		localStorage.setItem('slidemd:theme', theme);
	};

	const flyAnimation = {
		y: 20,
		duration: 300,
		easing: backInOut
	};
</script>

<button class="absolute right-4 top-2 h-8 w-8 text-secondary-text opacity-50" onclick={toggleDark}>
	{#if theme === 'light'}
		<div class="absolute" in:fly={flyAnimation} out:fly={flyAnimation}>
			<Light width="28" height="28" />
		</div>
	{:else}
		<div class="absolute" in:fly={flyAnimation} out:fly={flyAnimation}>
			<Dark width="28" height="28" />
		</div>
	{/if}
</button>
