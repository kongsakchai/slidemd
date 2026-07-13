<script lang="ts">
	import '@shikijs/magic-move/style.css'
	import { ShikiMagicMovePrecompiled } from '@shikijs/magic-move/svelte'
	import { useViewContext } from '@slidemd/slidemd/state'

	import lz from 'lz-string'

	interface Props {
		code: string
	}

	const { code: baseCode }: Props = $props()

	const viewContext = useViewContext()

	// svelte-ignore state_referenced_locally
	let steps = JSON.parse(lz.decompressFromBase64(baseCode))
	let step = $state(0)

	function animate() {
		step++
	}
</script>

<ShikiMagicMovePrecompiled {step} {steps} options={{ globalScale: viewContext.scale }} />

<button onclick={animate} class="absolute top-10 bg-red-300">Animate</button>
