<script lang="ts">
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left'
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right'
	import ExpandIcon from '@lucide/svelte/icons/expand'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import PaletteIcon from '@lucide/svelte/icons/palette'
	import ShrinkIcon from '@lucide/svelte/icons/shrink'
	import SlideIcon from '@lucide/svelte/icons/sliders-horizontal'
	import SunIcon from '@lucide/svelte/icons/sun'
	import ZoomIcon from '@lucide/svelte/icons/zoom-in'

	import { Button, buttonVariants } from '$lib/components/ui/button'
	import * as ButtonGroup from '$lib/components/ui/button-group'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
	import * as Popover from '$lib/components/ui/popover'
	import { defaultSlideConfig, slideConfig } from '$lib/states/config.svelte'
	import type { SlideController } from '$lib/types'

	import { themes } from '@slidemd/themes'

	import Slider from './slider.svelte'

	let {
		page,
		maxPage,
		fullscreen,
		onnext,
		onprevious,
		onfullscreen,
		zoom = $bindable(100)
	}: SlideController = $props()
</script>

{#snippet themeItem(name: string, builtin: boolean)}
	<DropdownMenu.Item onclick={() => (slideConfig.theme = name)}>
		<span class:text-primary={name === slideConfig.theme}>{name}</span>

		{#if builtin}
			<DropdownMenu.Shortcut>builtin</DropdownMenu.Shortcut>
		{/if}
	</DropdownMenu.Item>
{/snippet}

<section class=" fixed bottom-0 left-0 z-50 flex w-full p-5 transition-opacity duration-500 hover:opacity-100">
	<ButtonGroup.Root>
		<ButtonGroup.Root>
			<Button variant="outline" size="icon-lg" aria-label="back" onclick={onprevious}>
				<ArrowLeftIcon />
			</Button>
			<Button variant="outline" size="lg" class="px-4" aria-label="Go Back">
				<p>{page} / {maxPage || 0}</p>
			</Button>
			<Button variant="outline" size="icon-lg" aria-label="next" onclick={onnext}>
				<ArrowRightIcon />
			</Button>
		</ButtonGroup.Root>

		<ButtonGroup.Root>
			<!-- Fullscreen -->
			<Button variant="outline" size="icon-lg" aria-label="next" onclick={onfullscreen}>
				{#if fullscreen}
					<ShrinkIcon />
				{:else}
					<ExpandIcon />
				{/if}
			</Button>

			<!-- Zoom -->
			<Popover.Root>
				<Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'icon-lg' })} aria-label="zoom">
					<ZoomIcon />
				</Popover.Trigger>
				<Popover.Content class="flex flex-col gap-2 p-2" side="top" align="center" sideOffset={8}>
					<Slider id="zoom" min={100} max={500} step={1} default={100} unit="%" bind:value={zoom} />
				</Popover.Content>
			</Popover.Root>
		</ButtonGroup.Root>

		<ButtonGroup.Root>
			<!-- Dark Mode -->
			<Button
				variant="outline"
				size="icon-lg"
				aria-label="back"
				onclick={() => (slideConfig.dark = !slideConfig.dark)}
			>
				{#if slideConfig.dark}
					<MoonIcon />
				{:else}
					<SunIcon />
				{/if}
			</Button>

			<!-- Theme -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="icon-lg" aria-label="next">
							<PaletteIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56" align="start">
					<DropdownMenu.Label>Themes</DropdownMenu.Label>
					<DropdownMenu.Group>
						{@render themeItem('default', true)}
						{#each themes as theme}
							{@render themeItem(theme.name, !!theme.builtin)}
						{/each}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<!-- Config -->
			<Popover.Root>
				<Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'icon-lg' })} aria-label="setting">
					<SlideIcon />
				</Popover.Trigger>
				<Popover.Content class="flex flex-col gap-2 p-2 w-80" side="top" align="center" sideOffset={8}>
					<Slider
						title="Font Size"
						id="font-size"
						min={10}
						max={64}
						step={1}
						default={defaultSlideConfig.fontSize}
						unit="px"
						bind:value={slideConfig.fontSize}
					/>
					<Slider
						title="Slide Size"
						id="slide-size"
						min={300}
						max={2048}
						step={1}
						unit="px"
						default={defaultSlideConfig.size}
						bind:value={slideConfig.size}
					/>
					<Slider
						title="Slide Scale"
						id="slide-scale"
						min={10}
						max={100}
						step={1}
						unit="%"
						default={defaultSlideConfig.scale}
						bind:value={slideConfig.scale}
					/>
				</Popover.Content>
			</Popover.Root>
		</ButtonGroup.Root>
	</ButtonGroup.Root>
</section>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}
</style>
