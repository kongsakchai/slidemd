<script lang="ts">
	import { themes } from '$lib/state.svelte'
	import { onMount } from 'svelte'
	import '../app.css'

	const themesLoaded = import.meta.glob('../themes/*.css', { eager: true })

	let { children } = $props()

	onMount(() => {
		const themeNames = Object.keys(themesLoaded)
			.map((path) => {
				return path.split('/').pop()?.replace('.css', '')
			})
			.filter((name) => name !== undefined)

		themes.push('default', ...themeNames)
	})
</script>

{@render children()}
