import type { Directive } from '@slidemd/parser'

import type { SharedPageData } from '../types'
import { backgroundTransform } from './background'
import { paginationTransform } from './paginate'
import { splitLayoutTransformer } from './split'

export function transform(content: string, directive: Directive, shared: SharedPageData) {
	const paginate = paginationTransform(directive, shared)
	const background = backgroundTransform(directive)
	const splited = splitLayoutTransformer(content, directive)

	return [paginate, background, splited].filter(Boolean).join('\n')
}
