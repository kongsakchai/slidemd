<script lang="ts">
	import { settings } from '$lib/state.svelte'
	import { onMount } from 'svelte'
	import '../app.css'
	import { themeNames } from './slidemd.load'

	let { children } = $props()

	onMount(() => {
		settings.themes = ['default', ...themeNames]
		settings.load()
	})
</script>

{@render children()}
