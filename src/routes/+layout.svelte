<script lang="ts">
	import { settings } from '$lib/state.svelte'
	import { onMount } from 'svelte'
	import '../app.css'

	const themesLoaded = import.meta.glob('../themes/*.css', { eager: true })

	let { children } = $props()

	const getThemeName = (paths: string[]) => {
		return paths
			.map((path) => {
				return path.split('/').pop()?.replace('.css', '')
			})
			.filter((name) => name !== undefined)
	}

	onMount(() => {
		settings.themes = ['default', ...getThemeName(Object.keys(themesLoaded))]
		settings.theme = localStorage.getItem('slidemd:theme') || 'default'
	})
</script>

{@render children()}
