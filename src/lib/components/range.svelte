<script lang="ts">
	interface Props {
		value?: number
		min?: number
		max?: number
		step?: number
		defaultValue?: number
		onchange?: () => void
	}

	let { value = $bindable(), min, max, step, defaultValue, onchange }: Props = $props()

	const handleReset = () => {
		if (defaultValue !== undefined) {
			value = defaultValue
		} else {
			value = min || 0
		}

		if (onchange) onchange()
	}
</script>

<div class="grid grid-cols-[1fr_70px_24px] items-center gap-2">
	<input type="range" {min} {max} {step} class="w-full" bind:value {onchange} />

	<input type="number" {min} {max} {step} bind:value {onchange} />

	<button
		class="hover:bg-primary-hover reset-btn h-6 w-6 rounded-sm"
		aria-label="Reset settings"
		onclick={handleReset}
	></button>
</div>

<style lang="postcss">
	.reset-btn::before {
		content: '';
		display: block;
		width: 100%;
		height: 100%;
		background-color: var(--primary-foreground-2);
		mask: url('../icons/reload-icon.svg') no-repeat center;
		mask-size: 80%;
	}
</style>
