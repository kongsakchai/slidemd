<script lang="ts">
	import '@shikijs/magic-move/style.css'
	import { ShikiMagicMovePrecompiled } from '@shikijs/magic-move/svelte'

	import lz from 'lz-string'

	interface Props {
		code: string
	}

	const { code: baseCode }: Props = $props()

	let steps = JSON.parse(lz.decompressFromBase64(baseCode))
	let step = $state(0)

	function animate() {
		step++
	}
</script>

<ShikiMagicMovePrecompiled {step} {steps} />

<button onclick={animate} class="absolute top-10 bg-red-300">Animate</button>
