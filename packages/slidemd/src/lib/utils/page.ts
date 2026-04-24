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

export const slideWidth = 1280
export const slideHeight = 720

export function resolvePageSize(width: number, height: number, viewWidth: number, viewHeight: number) {
	const aspect = width / height
	const tempHeight = viewWidth / aspect
	const isOverHeight = tempHeight > viewHeight
	const finalWidth = isOverHeight ? viewHeight * aspect : viewWidth

	return finalWidth / width
}
