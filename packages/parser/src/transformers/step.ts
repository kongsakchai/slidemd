import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { asNumber } from '../utils'

const STEP_ATTR_PATTERN = /^step-(\d+)$/

export function stepTransformer(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (!('data' in node && node.data)) return
			if (!('hProperties' in node.data && node.data.hProperties)) return

			const maxStep = extractMaxStep(node.data.hProperties)
			if (maxStep == null) return

			node.data.hProperties.step = maxStep
			vfile.data.step = Math.max(asNumber(vfile.data.step, 0), maxStep)
		})
	}
}

function extractMaxStep(hProperties: Record<string, unknown>): number | null {
	if (!hProperties) return null

	let maxStep: number | null = null
	for (const key of Object.keys(hProperties)) {
		const match = STEP_ATTR_PATTERN.exec(key)
		if (!match) continue

		const step = Number.parseInt(match[1], 10)
		maxStep = maxStep == null ? step : Math.max(maxStep, step)
	}

	return maxStep
}
