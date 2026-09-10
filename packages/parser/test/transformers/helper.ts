import type { SlideContext, SlideData } from '../../src/types'

export interface BuildContextOptions {
	slides?: (SlideData & { breakIndex: number })[]
	style?: string[]
	script?: string[]
	extra?: Record<string, unknown>
}

// Minimal stand-in for VFile: transformers only read `vfile.data.context`,
// and `vfile` is not a declared dependency of this package.
export interface TestVFile {
	data: { context: SlideContext }
}

export function buildContext(options: BuildContextOptions = {}): SlideContext {
	return {
		slides: options.slides ?? [{ breakIndex: 0 }],
		style: options.style ?? [],
		script: options.script ?? [],
		extra: options.extra ?? {}
	}
}

export function buildVFile(options: BuildContextOptions = {}): TestVFile {
	return { data: { context: buildContext(options) } }
}

export function contextOf(vfile: TestVFile): SlideContext {
	return vfile.data.context
}

export function slideOf(vfile: TestVFile, index = 0): SlideData & { breakIndex: number } {
	return contextOf(vfile).slides[index]
}
