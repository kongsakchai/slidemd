<script lang="ts">
	import { useSlideContext } from '@decko/decko/state'

	const slideCtx = useSlideContext()

	const progress = $derived(((slideCtx.step + 1) / (slideCtx.maxStep + 1)) * 100)
</script>

<div class="absolute bottom-0 left-0 h-1 w-full">
	<div
		class="bg-primary h-full w-full origin-left transition-all duration-300 ease-in-out"
		style:scale="{progress}% 100%"
	></div>
</div>
