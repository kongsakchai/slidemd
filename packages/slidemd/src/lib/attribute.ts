import { type AttributeProcess } from '@slidemd/parser'

import { toSplitStyles } from './directive'
import { STEP_ATTR_PATTERN } from './logic/regex'

const splitProcess: AttributeProcess = {
	types: ['container'],
	key: 'split',
	process: (key, value, attr) => {
		const split = toSplitStyles(attr)
		if (split) {
			attr.style = [split, attr.style].filter(Boolean).join(';')
			delete attr[key]
		}
	}
}

const stepProcess: AttributeProcess = {
	key: STEP_ATTR_PATTERN,
	process: (key, value, attr) => {
		attr.step = ''
		return 'skip'
	}
}

export const attributeProcess: AttributeProcess[] = [splitProcess, stepProcess]
