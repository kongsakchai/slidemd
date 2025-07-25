import type { Parent, RootContent, RootContentMap } from 'mdast'

export const processCode = (node: RootContentMap['code'], index: number, parent: Parent) => {
	if (node.lang === 'mermaid') {
		// Convert Mermaid code blocks to HTML
		const html = `<pre class="mermaid">${node.value}</pre>`
		const newNode = {
			type: 'html',
			value: html
		}
		parent.children.splice(index, 1, newNode as RootContent)
	}
}
