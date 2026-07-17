import { type AttributeProcess, asNumber } from '@slidemd/parser'

import { toSplitStyles } from './directive'

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

const STEP_ATTR_PATTERN = /^step(?:-(\d+))?$/

const stepProcess: AttributeProcess = {
	key: STEP_ATTR_PATTERN,
	process: (key, value, attr, data) => {
		const match = STEP_ATTR_PATTERN.exec(key)
		if (!match) return
		if (match[1]) {
			const step = Number.parseInt(match[1], 10)
			attr.step = attr.step == null ? step : Math.max(asNumber(attr.step, 0), step)
		}

		if (!data) return
		data.step = Math.max(asNumber(attr.step, 0), asNumber(data.step, 0))
	}
}

export const attributeProcess: AttributeProcess[] = [splitProcess, stepProcess]
