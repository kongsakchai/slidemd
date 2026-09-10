import type { ElementContent, Root as HRoot, RootContent as HRootContent } from 'hast'
import type { Node, Parent, Root } from 'mdast'

export type Attribute = Record<string, string | number | boolean | (string | number)[] | null | undefined>

export type Directive = Record<string, unknown>

export interface SlideData {
	global?: Directive
	local?: Directive
	title?: string
}

export interface SlideContext {
	slides: (SlideData & { breakIndex: number })[]
	style: string[]
	script: string[]
	extra: Directive
}

export interface SlideInfo extends SlideData {
	index: number
	content: string
}

export interface SlideResult {
	slides: SlideInfo[]
	style: string[]
	script: string[]
	extra: Directive
}

// Transformers

export interface CodeContext {
	lang: string
	code: string
	meta: string
	attrs: Attribute
	slideCtx: SlideContext
	slide: SlideData
}

export type CodeHighlighter = (ctx: CodeContext) => Promise<HRootContent | ElementContent | HRoot>

export type CodeContainer = (ctx: CodeContext) => Promise<Parent>

export interface CodeblockOptions {
	highlighter?: CodeHighlighter
	container?: CodeContainer
}

export interface ExtensionContext {
	root: Root
	node: Node
	parents: Parent[]

	attribute: Attribute
	slideCtx: SlideContext
	slideData: SlideData
}

export type Extension = (ctx: ExtensionContext) => Promise<void> | void

export interface PostExtension {
	when: (ctx: ExtensionContext) => boolean
	extension: Extension
}

export interface ExtensionOptions {
	extensions?: Extension[]
	postExtensions?: PostExtension[]
}

export interface ContainerOptions {
	customContainer?: string[]
}
