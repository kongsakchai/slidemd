import type { Attribute, AttributeProcess } from '@slidemd/parser'

import { toSplitStyles } from './directive'

export const CUSTOM_CONTAINER: string[] = []
export const ATTRIBUTE_PROCESS: Record<string, AttributeProcess> = {
	split: splitProcess
}

function splitProcess(attr: Attribute) {
	const split = toSplitStyles(attr)
	if (split) {
		attr.style = [split, attr.style].join(';')
	}
	return attr
}
