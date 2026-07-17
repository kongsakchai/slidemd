<script lang="ts">
	import { useSlideContext } from '@slidemd/slidemd/state'

	const slideContext = useSlideContext()

	const progress = $derived(((slideContext.step + 1) / (slideContext.maxStep + 1)) * 100)
</script>

<!-- <progress value={slideContext.step + 1} max={slideContext.maxStep + 1}> 32% </progress> -->
<div class="absolute bottom-0 left-0 h-1 w-full">
	<div class="bg-primary h-full w-full origin-left" style:scale="{progress}% 100%"></div>
</div>
