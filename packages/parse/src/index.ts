import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { slidemdParser } from './parsers/index.js'
import { TransformOptions, applyTransformers } from './transform/index.js'
import { Directive } from './transform/types.js'
import { asNumber, asString } from './utils.js'

export interface Options {
	transform?: TransformOptions
}

export function setupProcessor(options?: Options) {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	applyTransformers(mdastTransform, options?.transform)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		allowDangerousHtml: true
	})

	return hastTransform.use(stringify, {
		allowDangerousHtml: true
	})
}

export interface File {
	value: string
	data: {
		style: string
		script: string
		step: number
		global: Directive
		local: Directive
	}
}

export function createParser(options?: Options) {
	const parser = setupProcessor(options)

	return {
		parse: async (value: string, shared: Directive): Promise<File> => {
			const file = await parser.process({ value: value, data: shared })
			return {
				value: file.toString(),
				data: {
					script: asString(file.data.script, ''),
					style: asString(file.data.style, ''),
					step: asNumber(file.data.step, 0),
					global: file.data.global as Directive,
					local: file.data.local as Directive
				}
			}
		}
	}
}
