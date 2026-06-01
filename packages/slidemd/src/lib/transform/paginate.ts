import type { Directive } from '@slidemd/parse'
import type { Store } from '@slidemd/slidemd/types'

export function paginationTransformer(content: string, store: Store, directive: Directive): string {
	const increment = directive['paginate'] !== 'skip' && directive['paginate'] !== 'hold'
	if (increment) {
		store.paginate++
	}

	const showPage = directive['paginate'] === true || directive['paginate'] === 'hold'
	return showPage ? `<div class="slide-page-number">${store.paginate}</div>\n${content}` : content
}
