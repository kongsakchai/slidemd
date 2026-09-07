import { type Attribute, type AttributeProcess } from '@decko/parser'

import lz from 'lz-string'

import { toSplitStyles } from './directive'
import { STEP_ATTR_PATTERN, extractSteps } from './step'
import { asNumber, asString } from './utils'

const splitProcess: AttributeProcess = {
	types: ['container'],
	key: 'split',
	process: (ctx) => {
		const split = toSplitStyles(ctx.attribute)
		if (!split) return

		ctx.attribute.style = [split, ctx.attribute.style].filter(Boolean).join(';')
		delete ctx.attribute[ctx.key]
	}
}

const stepProcess: AttributeProcess = {
	key: STEP_ATTR_PATTERN,
	process: (ctx) => {
		const stepData = extractSteps(ctx.attribute)

		if (!ctx.slide.local) ctx.slide.local = {}
		ctx.slide.local.step = Math.max(asNumber(ctx.slide.local?.step, 0), stepData.maxStep)

		const stepEntries = JSON.stringify(stepData.steps)
		compresseAttribute(ctx.attribute, `{@attach stepper(page,${stepEntries})}`)

		return 'skip'
	}
}

export function compresseAttribute(attrs: Attribute, ...add: string[]) {
	const compressed = add.map((s) => lz.compressToBase64(s))
	attrs['@compressed'] = [asString(attrs['@compressed'], ''), ...compressed].filter(Boolean).join(' ')
}

export function decompresseContent(content: string) {
	for (const match of content.matchAll(/@compressed="(.*?)"/g)) {
		const decompress = match[1].split(' ').map((s) => lz.decompressFromBase64(s))
		content = content.replaceAll(match[0], decompress.join(' '))
	}
	return content
}

export const attributeProcess: AttributeProcess[] = [splitProcess, stepProcess]
