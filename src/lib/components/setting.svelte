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
</script>

<div
	class="bg-primary border-line absolute bottom-[calc(100%+16px)] grid w-[350px] grid-cols-[80px_1fr] items-center gap-4 rounded-lg border px-4 py-3 text-sm"
>
	<p class="text-primary-foreground text-sm font-medium">Themes</p>
	<select class="w-full" bind:value={settings.theme} onchange={() => settings.setTheme(settings.theme)}>
		{#each settings.themes as theme}
			<option value={theme}>{theme}</option>
		{/each}
	</select>

	<p class="text-primary-foreground text-sm font-medium">Font Size</p>
	<Range
		bind:value={settings.fontSize}
		min={12}
		max={32}
		step={2}
		defaultValue={16}
		onchange={() => settings.setFontSize(settings.fontSize)}
	/>

	<p class="text-primary-foreground text-sm font-medium">Width</p>
	<Range
		bind:value={settings.width}
		min={640}
		max={1920}
		step={1}
		defaultValue={1280}
		onchange={() => settings.setWidth(settings.width)}
	/>

	<p class="text-primary-foreground text-sm font-medium">Size</p>
	<Range
		bind:value={settings.size}
		min={0.5}
		max={1.5}
		step={0.1}
		defaultValue={1}
		onchange={() => settings.setSize(settings.size)}
	/>

	<p class="text-primary-foreground text-sm font-medium">Aspect Ratio</p>
	<div class="flex justify-around gap-2">
		{#each aspectRatios as { label, value } (label)}
			<button
				class:border-action={settings.aspectRatioLabel === label}
				class:border-transparent={settings.aspectRatioLabel !== label}
				class="w-[40px] border-b-2 px-2 text-sm"
				onclick={() => settings.setAspectRatio(value, label)}
			>
				{label}
			</button>
		{/each}
	</div>
</div>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}
</style>
