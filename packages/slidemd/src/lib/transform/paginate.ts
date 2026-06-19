import { type Directive } from '@slidemd/parser'

import type { SharedPageData } from '../types'

export function paginationTransform(directive: Directive, shared: SharedPageData): string {
	const page = shared.paginate
	if (directive['paginate'] !== 'skip' && directive['paginate'] !== 'hold') shared.paginate++

	const showPage = directive['paginate'] === true || directive['paginate'] === 'hold'
	return showPage ? `<div class="slide-page-number">${page}</div>` : ''
}
