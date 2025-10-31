<script lang="ts">
	import { loadSlideConfig, saveSlideConfig, slideConfig } from '$lib/states/config.svelte'
	import { onMount } from 'svelte'
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
