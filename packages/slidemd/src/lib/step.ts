import type { Attribute } from '@slidemd/parser'

import { asNumber, asString } from './utils'

export const STEP_ATTR_PATTERN = /^step-(\d+)(?:-(\d+))?$/

export interface Stepper {
	index: number
	steps: Step[]
}

export type Step = [number, StepAction[]]

export interface StepAction {
	class: string[]
	action: 'add' | 'remove'
}

export function extractSteps(data: Attribute): { steps: Step[]; maxStep: number } {
	const steps = new Map<number, StepAction[]>()

	const appendStep = (stepStr: string, classes: string[], action: 'add' | 'remove') => {
		const step = Number.parseInt(stepStr, 10)
		if (!steps.has(step)) steps.set(step, [])
		steps.get(step)!.push({ action, class: classes })
		return step
	}

	let maxStep = asNumber(data.step) ?? 0

	for (const key in data) {
		const match = STEP_ATTR_PATTERN.exec(key)
		if (!match) continue

		const classes = asString(data[key])?.split(/\s+/).filter(Boolean)
		if (!classes || classes.length === 0) continue

		let step = appendStep(match[1], classes, 'add')
		maxStep = Math.max(maxStep, step)

		if (!match[2]) continue
		step = appendStep(match[2], classes, 'remove')
		maxStep = Math.max(maxStep, step)
	}

	return { steps: [...steps.entries()], maxStep }
}
