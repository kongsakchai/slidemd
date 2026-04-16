import path from 'path'

import { config } from './config'

export function resolveSlideLayoutId(src: string) {
	return path.join(config.module, src + '.svelte')
}

export function resolveSlideId(src: string) {
	return path.join(config.module, src + config.suffix)
}

export function makeMap<T, R>(array: T[], keyFn: (val: T) => string, valFn: (val: T) => R) {
	return Object.fromEntries(array.map((field) => [keyFn(field), valFn(field)])) as Record<string, R>
}
