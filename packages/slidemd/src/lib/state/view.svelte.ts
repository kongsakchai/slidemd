// import type { SlideData } from '@slidemd/slidemd/types'
import { createContext } from 'svelte'

export interface ViewContext {
	width: number
	height: number
	viewportWidth: number
	viewportHeight: number
	fontSize: number
	zoom: number
	size: number
}

export const [getViewContext, setViewContext] = createContext<ViewContext>()

export function createViewContext(source?: Partial<ViewContext>) {
	const ctx = $state<ViewContext>({
		width: source?.width ?? 1280,
		height: source?.height ?? 720,
		viewportWidth: source?.viewportWidth ?? 1280,
		viewportHeight: source?.viewportHeight ?? 720,
		fontSize: source?.fontSize ?? 16,
		zoom: source?.zoom ?? 1,
		size: source?.size ?? 1
	})
	setViewContext(ctx)

	return ctx
}

export function useViewContext() {
	const ctx = getViewContext()

	return {
		get width() {
			return ctx.width
		},
		set width(val: number) {
			ctx.width = val
		},
		get height() {
			return ctx.height
		},
		set height(val: number) {
			ctx.height = val
		},
		get viewportWidth() {
			return ctx.viewportWidth
		},
		set viewportWidth(val: number) {
			ctx.viewportWidth = val
		},
		get viewportHeight() {
			return ctx.viewportHeight
		},
		set viewportHeight(val: number) {
			ctx.viewportHeight = val
		},
		get fontSize() {
			return ctx.fontSize
		},
		set fontSize(val: number) {
			ctx.fontSize = val
		},
		get zoom() {
			return ctx.zoom
		},
		set zoom(val: number) {
			ctx.zoom = val
		},
		get size() {
			return ctx.size
		},
		set size(val: number) {
			ctx.size = val
		},
		get scale() {
			const aspect = ctx.width / ctx.height
			if (aspect === 0) return 0

			const tempHeight = ctx.viewportWidth / aspect
			const isOverHeight = tempHeight > ctx.viewportHeight
			const finalWidth = isOverHeight ? ctx.viewportHeight * aspect : ctx.viewportWidth

			return (finalWidth / ctx.width) * ctx.size
		}
	}
}
