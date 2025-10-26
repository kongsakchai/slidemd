<script lang="ts">
	import { settings } from '$lib/state.svelte'
	import { themes } from '@slidemd/config'
	import { onMount } from 'svelte'
	import '../app.css'

	let { children } = $props()

	onMount(() => {
		console.log('🌱 themes loaded:', themes.length)

		settings.themes = ['default', ...themes]
		settings.load()
	})
</script>

{@render children()}
