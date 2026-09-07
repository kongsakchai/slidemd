import type { Directive } from '@decko/parser'

export enum Feature {
	Mermaid,
	MagicMove,
	Code
}

export function getFeatures(extra: Directive) {
	if (!extra.features) extra.features = new Set<Feature>()
	return extra.features as Set<Feature>
}
