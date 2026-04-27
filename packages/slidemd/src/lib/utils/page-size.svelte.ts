export const slideWidth = 1280
export const slideHeight = 720

export function resolvePageSize(width: number, height: number, viewWidth: number, viewHeight: number) {
	const aspect = width / height
	const tempHeight = viewWidth / aspect
	const isOverHeight = tempHeight > viewHeight
	const finalWidth = isOverHeight ? viewHeight * aspect : viewWidth

	return finalWidth / width
}
