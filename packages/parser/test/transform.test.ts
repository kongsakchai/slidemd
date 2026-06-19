import { describe } from 'vitest'

import { attributeTransformTestcase } from './transformers/attribute'
import { codeblockTransformTestcase } from './transformers/codeblock'
import { directiveTransformerTestcase } from './transformers/directive'
import { extractScriptTransformerTestcase } from './transformers/extract-script'
import { utilsTestcase } from './transformers/utils'

describe('basic syntax', () => {
	attributeTransformTestcase()
})

describe('codeblock syntax', () => {
	codeblockTransformTestcase()
})

describe('extract script', () => {
	extractScriptTransformerTestcase()
})

describe('directive script', () => {
	directiveTransformerTestcase()
})

describe('utils', () => {
	utilsTestcase()
})
