<script lang="ts">
	import Slide from './example/marp.md'

	let currentPage = $state(1)
</script>

<main class="h-full w-full p-6">
	<Slide bind:page={currentPage} />
</main>
