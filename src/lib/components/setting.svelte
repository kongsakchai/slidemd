<script lang="ts">
	import { settings, themes } from '$lib/state.svelte'
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

	const isSelectedAspectRatio = (id: number) => {
		if (settings.aspectRatioLabel === aspectRatios[id].label) {
			return 'selected'
		}
		return ''
	}

	const handleSelectTheme = (e: Event) => {
		const target = e.target as HTMLSelectElement
		const selectedTheme = target.value

		if (themes.includes(selectedTheme)) {
			settings.theme = selectedTheme
			document.documentElement.setAttribute('data-theme', selectedTheme)
			localStorage.setItem('slidemd:theme', selectedTheme)
		}
	}
</script>

<div
	class="menu absolute bottom-[calc(100%+16px)] grid w-[350px] grid-cols-[80px_1fr] items-center gap-x-2 gap-y-1 text-sm"
>
	<p>Themes</p>
	<select class="w-full" onchange={handleSelectTheme}>
		{#each themes as theme}
			<option value={theme} selected={settings.theme === theme}>{theme}</option>
		{/each}
	</select>

	<p class="col-start-1">Font Size</p>
	<Range bind:value={settings.fontSize} min={12} max={32} step={2} defaultValue={16} />

	<p class="col-start-1">Width</p>
	<Range bind:value={settings.width} min={640} max={1920} step={1} defaultValue={1280} />

	<p class="col-start-1">Size</p>
	<Range bind:value={settings.size} min={0.5} max={1.5} step={0.1} defaultValue={1} />

	<p class="col-start-1">Aspect Ratio</p>
	<div class="flex gap-2">
		{#each aspectRatios as { label }, i}
			<button class=" px-2 text-sm {isSelectedAspectRatio(i)}" data-index={i} onclick={handleSetAspectRatio}
				>{label}</button
			>
		{/each}
	</div>
</div>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}

	.menu {
		background-color: var(--primary);
		color: var(--secondary-foreground);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 16px 12px;
	}

	.selected {
		@apply border-b-2 border-[var(--action)];
	}

	.reset-btn {
		border-radius: 4px;
		width: 24px;
		height: 24px;

		&:hover {
			background-color: var(--primary-hover);
		}

		&::before {
			content: '';
			display: block;
			width: 100%;
			height: 100%;
			background-color: var(--secondary-foreground);
			mask: url('../icons/reload-icon.svg') no-repeat center;
			mask-size: 75%;
		}
	}
</style>
