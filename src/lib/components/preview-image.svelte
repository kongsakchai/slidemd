<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside'
	import { onMount } from 'svelte'

	let open = $state(false)
	let src = $state<string | null>(null)
	let alt = $state<string | null>(null)

	const close = () => {
		open = false
	}

	onMount(() => {
		const openPreview = (e: Event) => {
			const target = e.target as HTMLImageElement
			src = target.src
			alt = target.alt || null
			open = true
		}

		const images = document.querySelectorAll('img')
		images.forEach((img) => {
			img.addEventListener('click', openPreview)
		})

		return () => {
			images.forEach((img) => {
				img.removeEventListener('click', openPreview)
			})
		}
	})
</script>

{#if open}
	<section
		class="bg-primary-foreground/50 bg-opacity-75 fixed z-[60] flex h-screen w-screen items-center justify-center backdrop-blur-xs"
	>
		<img
			use:clickOutside={close}
			class="max-h-[90%] max-w-[90%]"
			{src}
			alt={alt || 'Preview Image'}
			loading="lazy"
		/>
	</section>
{/if}
