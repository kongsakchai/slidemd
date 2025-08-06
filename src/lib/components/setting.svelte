<script lang="ts">
	import { settings } from '$lib/state.svelte'
	import Range from './range.svelte'

	const aspectRatios = [
		{
			label: '16:9',
			value: 16 / 9
		},
		{
			label: '4:3',
			value: 4 / 3
		},
		{
			label: '1:1',
			value: 1 / 1
		}
	]

	const handleSetAspectRatio = (e: Event) => {
		const target = e.target as HTMLButtonElement
		const dataIndex = target.getAttribute('data-index')
		const index = dataIndex ? parseInt(dataIndex) : null

		settings.aspectRatioLabel = aspectRatios[index || 0].label
		settings.aspectRatio = aspectRatios[index || 0].value
	}

	const handleSelectTheme = (e: Event) => {
		const target = e.target as HTMLSelectElement
		const selectedTheme = target.value

		if (settings.themes.includes(selectedTheme)) {
			settings.theme = selectedTheme
			document.documentElement.setAttribute('data-theme', selectedTheme)
			localStorage.setItem('slidemd:theme', selectedTheme)
		}
	}
</script>

<div
	class="bg-primary border-line absolute bottom-[calc(100%+16px)] grid w-[350px] grid-cols-[80px_1fr] items-center gap-2 rounded-lg border px-4 py-3 text-sm"
>
	<p class="text-primary-foreground text-sm font-medium">Themes</p>
	<select class="w-full" onchange={handleSelectTheme}>
		{#each settings.themes as theme}
			<option value={theme} selected={settings.theme === theme}>{theme}</option>
		{/each}
	</select>

	<p class="text-primary-foreground text-sm font-medium">Font Size</p>
	<Range bind:value={settings.fontSize} min={12} max={32} step={2} defaultValue={16} />

	<p class="text-primary-foreground text-sm font-medium">Width</p>
	<Range bind:value={settings.width} min={640} max={1920} step={1} defaultValue={1280} />

	<p class="text-primary-foreground text-sm font-medium">Size</p>
	<Range bind:value={settings.size} min={0.5} max={1.5} step={0.1} defaultValue={1} />

	<p class="text-primary-foreground text-sm font-medium">Aspect Ratio</p>
	<div class="flex gap-2">
		{#each aspectRatios as { label }, i}
			<button
				class:border-action={settings.aspectRatioLabel === aspectRatios[i].label}
				class:border-transparent={settings.aspectRatioLabel !== aspectRatios[i].label}
				class="w-[40px] border-b-2 px-2 text-sm"
				data-index={i}
				onclick={handleSetAspectRatio}>{label}</button
			>
		{/each}
	</div>
</div>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}
</style>
