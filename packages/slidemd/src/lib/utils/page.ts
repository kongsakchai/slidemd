export enum PageAction {
	NEXT,
	PREVIOUS
}

export interface PageState {
	page: number
	step: number
}

export function updatePageState(
	page: number,
	maxPage: number,
	step: number,
	maxStep: number,
	action: PageAction
): PageState {
	const state = { page, step }

	switch (action) {
		case PageAction.NEXT:
			if (step < maxStep) return { page, step: step + 1 }
			if (page < maxPage) return { page: page + 1, step: 0 }
			return state

		case PageAction.PREVIOUS:
			if (step > 0) return { page, step: step - 1 }
			if (page > 0) return { page: page - 1, step: maxStep }
			return state

		default:
			return state
	}
}
