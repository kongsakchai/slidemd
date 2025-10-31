<script lang="ts">
	import ReloadIcon from '@lucide/svelte/icons/rotate-ccw'

	import { Button } from './ui/button'
	import { Input } from './ui/input'
	import { Label } from './ui/label'
	import { Slider } from './ui/slider'

	interface Props {
		title: string
		id: string
		min: number
		max: number
		step: number
		default: number
		value: number
	}

	let { title, id, min, max, step, default: defaultValue, value = $bindable(0) }: Props = $props()
</script>

<div class="grid grid-cols-8 items-center gap-4">
	<Label for={id} class="col-span-2">{title}</Label>
	<Slider {id} bind:value type="single" {min} {max} {step} class="col-span-3 h-8" />
	<Input id="{id}-input" bind:value class="col-span-2 h-8" />
	<Button variant="outline" size="icon-sm" aria-label="next" onclick={() => (value = defaultValue)}>
		<ReloadIcon />
	</Button>
</div>
