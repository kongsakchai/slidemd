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
		const themeNames = getThemeName(Object.keys(themesLoaded))

		settings.themes = ['default', ...themeNames]
		settings.loadTheme()
		settings.loadAspectRatio()
	})
</script>

{@render children()}
