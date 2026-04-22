<script lang="ts">
	import { SlideLayout } from '@lib/components'

	import Slide from './example/marp.md'

	let page = $state(1)
</script>

<main class="h-full w-full">
	<SlideLayout>
		<Slide bind:page />
	</SlideLayout>
</main>
