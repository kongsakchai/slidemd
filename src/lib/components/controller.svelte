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
	let openSettings = $state(false)

	const handleCloseSetting = () => {
		openSettings = false
	}

	const handleToggleSetting = () => {
		openSettings = !openSettings
	}
</script>

<svelte:document
	onkeydown={(e) => {
		if (e.repeat) return

		if (e.key === 'ArrowLeft') {
			onPrevious?.()
		} else if (e.key === 'ArrowRight') {
			onNext?.()
		}
	}}
/>

<div class="menu">
	<button class="menu-btn previous-btn" aria-label="previous" onclick={onPrevious} disabled={disabledPrevious}
	></button>
	<p class="text-sm font-medium select-none">{currentPage} / {maxPage || 0}</p>
	<button class="menu-btn next-btn" aria-label="next" onclick={onNext} disabled={disabledNext}></button>

	<div class="divider"></div>

	<section use:clickOutside={handleCloseSetting} class="relative h-8 w-8">
		<button class="menu-btn setting-btn" aria-label="settings" onclick={handleToggleSetting}> </button>

		{#if openSettings}
			<Setting />
		{/if}
	</section>
</div>

<style lang="postcss">
	p {
		margin: 0;
		padding: 0;
	}

	.menu {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background-color: var(--primary);
		padding: 8px;
		color: var(--primary-foreground);
	}

	.menu-btn {
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

	.menu-btn.previous-btn::before {
		mask: url('../icons/left-icon.svg') no-repeat center;
	}

	.menu-btn.next-btn::before {
		mask: url('../icons/right-icon.svg') no-repeat center;
	}

	.menu-btn.setting-btn::before {
		mask: url('../icons/setting-icon.svg') no-repeat center;
	}

	.divider {
		width: 1px;
		height: 24px;
		background-color: var(--line);
	}
</style>
