<script lang="ts">
	import { defualtSlideConfig, slideConfig } from '$lib/states/config.svelte'
	import type { SlideController } from '$lib/types'

	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left'
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right'
	import ExpandIcon from '@lucide/svelte/icons/expand'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import PaletteIcon from '@lucide/svelte/icons/palette'
	import ShrinkIcon from '@lucide/svelte/icons/shrink'
	import SlideIcon from '@lucide/svelte/icons/sliders-horizontal'
	import SunIcon from '@lucide/svelte/icons/sun'

	import { themes } from '@slidemd/themes'

	import SliderField from '../slider-field.svelte'
	import { Button, buttonVariants } from '../ui/button'
	import * as ButtonGroup from '../ui/button-group'
	import * as DropdownMenu from '../ui/dropdown-menu'
	import * as Popover from '../ui/popover'

	let { page, maxPage, fullscreen, onnext, onprevious, onfullscreen }: SlideController = $props()
</script>

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
			<Button variant="outline" size="icon-lg" aria-label="next" onclick={onfullscreen}>
				{#if fullscreen}
					<ShrinkIcon />
				{:else}
					<ExpandIcon />
				{/if}
			</Button>
		</ButtonGroup.Root>

		<ButtonGroup.Root>
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
						<DropdownMenu.Item onclick={() => (slideConfig.theme = 'default')}>
							<span class:text-primary={'default' === slideConfig.theme}>default</span>
							<DropdownMenu.Shortcut>builtin</DropdownMenu.Shortcut>
						</DropdownMenu.Item>
						{#each themes as theme}
							<DropdownMenu.Item onclick={() => (slideConfig.theme = theme.name)}>
								<span class:text-primary={theme.name === slideConfig.theme}>{theme.name}</span>

								{#if theme.builtin}
									<DropdownMenu.Shortcut>builtin</DropdownMenu.Shortcut>
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<!-- Config -->
			<Popover.Root>
				<Popover.Trigger class={buttonVariants({ variant: 'outline', size: 'icon-lg' })} aria-label="setting">
					<SlideIcon />
				</Popover.Trigger>
				<Popover.Content class="flex w-90 flex-col gap-4" side="top" align="start">
					<SliderField
						title="Font Size"
						id="font-size"
						min={10}
						max={64}
						step={1}
						default={defualtSlideConfig.fontSize}
						bind:value={slideConfig.fontSize}
					/>
					<SliderField
						title="Size"
						id="size"
						min={300}
						max={2048}
						step={1}
						default={defualtSlideConfig.size}
						bind:value={slideConfig.size}
					/>
					<SliderField
						title="Scale"
						id="scale"
						min={0.1}
						max={1}
						step={0.05}
						default={defualtSlideConfig.scale}
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
