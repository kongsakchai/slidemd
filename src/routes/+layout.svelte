<script lang="ts">
	import { settings } from '$lib/state.svelte'
	import { onMount } from 'svelte'
	import '../app.css'
	import { themesLoaded } from './init-slidemd'

	let { children } = $props()

	const getThemeNames = (paths: string[]) => {
		return paths
			.map((path) => {
				return path.split('/').pop()?.replace('.css', '')
			})
			.filter((name) => name !== undefined)
	}

	onMount(() => {
		const themeNames = getThemeNames(Object.keys(themesLoaded))

		settings.themes = ['default', ...themeNames]
		settings.loadTheme()
		settings.loadAspectRatio()
	})
</script>

{@render children()}
