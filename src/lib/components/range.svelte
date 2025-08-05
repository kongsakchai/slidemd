<script lang="ts">
	interface Props {
		value?: number
		min?: number
		max?: number
		step?: number
		defaultValue?: number
	}

	let { value = $bindable(), min, max, step, defaultValue }: Props = $props()

	const handleReset = () => {
		if (defaultValue !== undefined) {
			value = defaultValue
		} else {
			value = min || 0
		}
	}
</script>

<div class="grid grid-cols-[1fr_70px_24px] items-center gap-2">
	<input type="range" {min} {max} {step} class="w-full" bind:value />

	<input type="number" {min} {max} {step} bind:value />

	<button class="reset-btn" aria-label="Reset settings" onclick={handleReset}></button>
</div>

<style lang="postcss">
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
			mask-size: 80%;
		}
	}
</style>
