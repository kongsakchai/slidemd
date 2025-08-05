<script lang="ts">
	import { clickOutside } from '$lib/action.svelte'
	import Setting from './setting.svelte'

	interface Props {
		currentPage: number
		maxPage: number
		disabledNext?: boolean
		disabledPrevious?: boolean
		onNext?: () => void
		onPrevious?: () => void
	}

	let { currentPage, onNext, onPrevious, maxPage, disabledNext, disabledPrevious }: Props = $props()
	let openSettings = $state(true)

	const handleCloseSetting = () => {
		openSettings = false
	}

	const handleToggleSetting = () => {
		openSettings = !openSettings
	}
</script>

<div class="menu fixed bottom-[20px] left-[20px] z-50 flex items-center justify-center">
	<button class="menu-btn previous-btn" aria-label="previous" onclick={onPrevious} disabled={disabledPrevious}
	></button>
	<p class="text-xs font-medium select-none">{currentPage} / {maxPage || 0}</p>
	<button class="menu-btn next-btn" aria-label="next" onclick={onNext} disabled={disabledNext}></button>

	<div class="divider"></div>

	<div use:clickOutside={handleCloseSetting} class="relative h-8 w-8">
		<button class="menu-btn setting-btn relative" aria-label="settings" onclick={handleToggleSetting}> </button>

		{#if openSettings}
			<Setting />
		{/if}
	</div>
</div>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}

	.menu {
		gap: 8px;
		padding: 8px;
		border-radius: 8px;
		background-color: var(--primary);
		color: var(--secondary-foreground);
		border: 1px solid var(--line);
	}

	.menu .menu-btn {
		border-radius: 4px;
		width: 32px;
		height: 32px;

		&:not(:disabled):hover {
			background-color: var(--primary-hover);
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

	.setting-btn::before {
		mask: url('../icons/setting-icon.svg') no-repeat center;
	}

	.divider {
		width: 1px;
		height: 24px;
		background-color: var(--line);
	}
</style>
