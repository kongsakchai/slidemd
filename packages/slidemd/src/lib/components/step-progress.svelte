<script lang="ts">
	import { useSlideContext } from '@slidemd/slidemd/state'

	const slideContext = useSlideContext()

	const progress = $derived(((slideContext.step + 1) / (slideContext.maxStep + 1)) * 100)
</script>

<div class="absolute bottom-0 left-0 h-1 w-full">
	<div
		class="bg-primary h-full w-full origin-left transition-all duration-300 ease-in-out"
		style:scale="{progress}% 100%"
	></div>
</div>
