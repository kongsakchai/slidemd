<script lang="ts">
	import { onMount } from 'svelte'

	import { loadSlideConfig, saveSlideConfig, slideConfig } from '$lib/states/config.svelte'

	import '@slidemd/themes'

	import '../app.css'

	let { children } = $props()

	onMount(loadSlideConfig)

	$effect(saveSlideConfig)

	$effect(() => {
		if (slideConfig.dark) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	})

	$effect(() => {
		document.documentElement.setAttribute('data-theme', slideConfig.theme || 'default')
	})
</script>

{@render children()}
