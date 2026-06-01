import type { Directive } from '@slidemd/parse'
import type { Store, Transformer } from '@slidemd/slidemd/types'

import { backgroundTransformer } from './background'
import { extractClassStyleTransformer } from './extract-class-style'
import { paginationTransformer } from './paginate'
import { splitLayoutTransformer } from './split'

export function createTransformer() {
	const beforeLayout: Transformer[] = [extractClassStyleTransformer]
	const layout: Transformer[] = [splitLayoutTransformer]
	const afterLayout: Transformer[] = [backgroundTransformer, paginationTransformer]

	const pushBefore = (transformer: Transformer) => beforeLayout.push(transformer)
	const pushLayout = (transformer: Transformer) => layout.push(transformer)
	const pushAfter = (transformer: Transformer) => afterLayout.push(transformer)

	const process = (content: string, store: Store, directive: Directive) => {
		return [...beforeLayout, ...layout, ...afterLayout].reduce((previous, transformer) => {
			return transformer(previous, store, directive)
		}, content)
	}

	return {
		pushBefore,
		pushLayout,
		pushAfter,
		process
	}
}
