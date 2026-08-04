import { join } from 'node:path'

import { VirtualModule } from './types'

const MARKDOWN_ID = '@slide:markdown/'

export const virtualMarkdown: VirtualModule = {
	id: MARKDOWN_ID,
	content() {
		const src = this.id.slice(MARKDOWN_ID.length)
		return this.read(join(this.root, src)) || `<h1>404</h1>`
	}
}
