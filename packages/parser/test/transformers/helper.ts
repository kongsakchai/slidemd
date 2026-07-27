import { VFile } from 'vfile'

import type { SlideContext, SlideData } from '../../src/types'

export interface BuildContextOptions {
	slides?: (SlideData & { breakIndex: number })[]
	style?: string[]
	script?: string[]
	extra?: Record<string, unknown>
}

export function buildContext(options: BuildContextOptions = {}): SlideContext {
	return {
		slides: options.slides ?? [{ breakIndex: 0 }],
		style: options.style ?? [],
		script: options.script ?? [],
		extra: options.extra ?? {}
	}
}

export function buildVFile(options: BuildContextOptions = {}): VFile {
	const vfile = new VFile()
	vfile.data.context = buildContext(options)
	return vfile
}

export function contextOf(vfile: VFile): SlideContext {
	return vfile.data.context as SlideContext
}

export function slideOf(vfile: VFile, index = 0): SlideData & { breakIndex: number } {
	return contextOf(vfile).slides[index]
}
