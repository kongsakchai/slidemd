import mermaid from 'mermaid'
import { onMount } from 'svelte'

export async function renderMermaid() {
	mermaid.initialize({
		startOnLoad: false
	})

	onMount(async () => {
		const renderContainer = document.createElement('div')
		renderContainer.id = 'mermaid-render'
		document.body.appendChild(renderContainer)

		const mermaidBlocks = document.getElementsByName('mermaid')
		for (let i = 0; i < mermaidBlocks.length; i++) {
			const block = mermaidBlocks.item(i)

			const id = 'mermaid-' + Date.now().toString(16) + i
			const { svg } = await mermaid.render(id, block.innerText, renderContainer)
			block.innerHTML = svg
		}

		console.log('process mermaid ' + mermaidBlocks.length)
	})
}
