<script lang="ts">
	import ReloadIcon from '@lucide/svelte/icons/rotate-ccw'

	import { Button } from '$lib/components/ui/button'
	import { Label } from '$lib/components/ui/label'
	import { Separator } from '$lib/components/ui/separator'
	import { Slider } from '$lib/components/ui/slider'

	interface Props {
		title?: string
		id?: string
		min?: number
		max?: number
		step?: number
		default?: number
		value?: number
		unit?: string
	}

	let { title, id, min, max, step, default: defaultValue = 0, value = $bindable(0), unit }: Props = $props()
</script>

<div class="flex items-center gap-2">
	{#if title}
		<Label for={id} class="text-xs w-16">{title}</Label>
	{/if}
	<Slider {id} bind:value type="single" {min} {max} {step} class="flex-1" />
	<Label for={id} class="text-xs w-12 justify-end">{value} {unit}</Label>
	<Separator orientation="vertical" />
	<Button
		variant="outline"
		size="icon-sm"
		aria-label="reset {title || id || 'value'}"
		onclick={() => (value = defaultValue)}
	>
		<ReloadIcon />
	</Button>
</div>
