import { parse } from 'yaml'

import { Directive } from './types'

export function asString(v: unknown, defaultVal: string): string
export function asString(v: unknown, defaultVal?: undefined): string | undefined
export function asString(v: unknown, defaultVal?: string): string | undefined {
	return typeof v === 'string' ? v : defaultVal
}

export function asNumber(v: unknown, defaultVal: number): number
export function asNumber(v: unknown, defaultVal?: undefined): number | undefined
export function asNumber(v: unknown, defaultVal?: number): number | undefined {
	return typeof v === 'number' ? v : defaultVal
}

export function parseYAML(value: string) {
	try {
		return parse(value) as Directive
	} catch {
		console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m directive syntax invalid:\x1b[0m\n${value}`)
		return {} as Directive
	}
}
