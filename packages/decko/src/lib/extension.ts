import { type Attribute, type Extension, type PostExtension, hoistToParentExtension } from '@decko/parser'

import lz from 'lz-string'

import { toSplitStyles } from './directive'
import { extractSteps } from './step'
import { asNumber, asString } from './utils'

export const splitContainerExtension: Extension = (ctx) => {
	if (ctx.node.type !== 'container' || !ctx.attribute.split) return

	const split = toSplitStyles(ctx.attribute)
	if (!split) return

	ctx.attribute.style = [split, ctx.attribute.style].filter(Boolean).join(';')
	delete ctx.attribute.split
}

export const stepExtension: Extension = (ctx) => {
	const stepData = extractSteps(ctx.attribute)
	if (stepData.steps.length === 0) return

	if (!ctx.slideData.local) ctx.slideData.local = {}
	ctx.slideData.local.step = Math.max(asNumber(ctx.slideData.local?.step, 0), stepData.maxStep)

	const stepEntries = JSON.stringify(stepData.steps)
	compresseAttribute(ctx.attribute, `{@attach stepper(page,${stepEntries})}`)
}

export const hoistExtension: PostExtension = {
	when: (ctx) => {
		return (
			ctx.attribute.bg !== undefined ||
			!!asString(ctx.attribute.class)?.includes('absolute') ||
			!!asString(ctx.attribute.style)?.includes('absolute')
		)
	},
	extension: hoistToParentExtension
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
