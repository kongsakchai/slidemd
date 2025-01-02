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

<div class="absolute right-0 top-0 p-4 opacity-0 transition-opacity duration-300 hover:opacity-50">
	<button class="relative h-7 w-7 text-secondary-text" onclick={toggleDark}>
		{#if theme === 'light'}
			<div class="absolute left-0 top-0" in:fly={flyAnimation} out:fly={flyAnimation}>
				<Light width="28" height="28" />
			</div>
		{:else}
			<div class="absolute left-0 top-0" in:fly={flyAnimation} out:fly={flyAnimation}>
				<Dark width="28" height="28" />
			</div>
		{/if}
	</button>
</div>
