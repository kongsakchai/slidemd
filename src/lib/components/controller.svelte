<script lang="ts">
	interface Props {
		currentPage: number
		maxPage: number
		disabledNext?: boolean
		disabledPrevious?: boolean
		onNext?: () => void
		onPrevious?: () => void
	}

	let { currentPage, onNext, onPrevious, maxPage, disabledNext, disabledPrevious }: Props = $props()
</script>

<div class="menu fixed bottom-[20px] left-[20px] z-50 flex items-center justify-center">
	<button class="previous-btn" aria-label="previous" onclick={onPrevious} disabled={disabledPrevious}></button>
	<p class="m-0 p-0 text-xs leading-0 font-medium select-none">{currentPage} / {maxPage || 0}</p>
	<button class="next-btn" aria-label="next" onclick={onNext} disabled={disabledNext}></button>
</div>

<style lang="postcss">
	.menu {
		display: flex;
		gap: 8px;
		padding: 8px;
		border-radius: 8px;
		background-color: var(--primary);
		color: var(--secondary-foreground);
	}

	.menu > button {
		border-radius: 4px;
		width: 32px;
		height: 32px;

		&:not(:disabled):hover {
			background-color: color-mix(in srgb, var(--secondary-foreground) 10%, transparent);
		}

		&::before {
			content: '';
			display: block;
			width: 100%;
			height: 100%;
			background-color: var(--secondary-foreground);
		}

		&:disabled {
			opacity: 0.5;
		}
	}

	.previous-btn::before {
		mask: url('../icons/left-icon.svg') no-repeat center;
	}

	.next-btn::before {
		mask: url('../icons/right-icon.svg') no-repeat center;
	}
</style>
