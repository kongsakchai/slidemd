import mermaid from 'mermaid'

mermaid.initialize({
	startOnLoad: false
})

const cache = new Map<string, string>()

let renderContainer: HTMLElement

export function mermaidRender(node: HTMLElement) {
	node.hidden = true

	const render = async () => {
		if (!renderContainer) {
			renderContainer = document.createElement('div')
			renderContainer.id = 'mermaid-render'
			document.body.appendChild(renderContainer)
		}

		const id = 'mermaid-' + (await hashString(node.innerText))
		if (cache.has(id)) {
			node.innerHTML = cache.get(id)!
		} else {
			const { svg } = await mermaid.render(id, node.innerText, renderContainer)
			node.innerHTML = svg
			cache.set(id, svg)
		}

		node.hidden = false
	}

	render()
}

async function hashString(str: string) {
	const encoder = new TextEncoder()
	const data = encoder.encode(str)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)

	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
