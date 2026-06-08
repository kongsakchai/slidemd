import { type Directive, asString } from '@slidemd/parse'
import type { Store } from '@slidemd/slidemd/types'

export function extractClassStyleTransformer(content: string, store: Store, directive: Directive) {
	store.class.push(asString(directive.class, '').trim())
	const style = asString(directive.style, '').trim()
	store.style.push(style.endsWith(';') ? style.slice(0, -1) : style)

	return content
}
