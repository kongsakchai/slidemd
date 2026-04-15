<script lang="ts">
	import Slide from './lib/marp.md'

	let currentPage = $state(1)
</script>

<main class="h-fullsw-full p-6">
	<Slide bind:page={currentPage} />
</main>
