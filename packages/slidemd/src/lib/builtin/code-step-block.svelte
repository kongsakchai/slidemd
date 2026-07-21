<script lang="ts">
	import '@shikijs/magic-move/style.css'
	import { ShikiMagicMovePrecompiled } from '@shikijs/magic-move/svelte'
	import { useSlideContext, useViewContext } from '@slidemd/slidemd/state'

	import lz from 'lz-string'

	interface Props {
		code: string
		start?: number
	}

	const { code: baseCode, start = 0 }: Props = $props()

	const viewContext = useViewContext()
	const slideContext = useSlideContext()

	// svelte-ignore state_referenced_locally
	let steps = JSON.parse(lz.decompressFromBase64(baseCode))
	let step = $derived(Math.max(0, Math.min(slideContext.step - start, steps.length)))
</script>

<ShikiMagicMovePrecompiled class="code-block" {step} {steps} options={{ globalScale: viewContext.scale }} />
