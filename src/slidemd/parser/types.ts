import type { Parent } from 'mdast'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Attribuites = Record<string, any>

export interface ImageAttributes {
	filters?: string[]
	fit?: string
	w?: string
	h?: string
	x?: string
	y?: string
	pos?: string
	top?: string
	left?: string
	right?: string
	bottom?: string
	repeat?: string
	rx?: string
	ry?: string
	vertical?: boolean
	bg?: boolean
	absolute?: boolean
	size?: string
}

export interface CodeToHighlight {
	code: string
	lang: string
	parent: Parent
}

export interface SplitData {
	start: number
	end?: number
	directive: Attribuites
}
