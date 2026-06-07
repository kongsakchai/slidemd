import { describe } from 'vitest'

import { attributeTransformTestcase } from './transform/attribute-block'
import { codeblockTransformTestcase } from './transform/codeblock'
import { directiveTransformerTestcase } from './transform/directive'
import { extractScriptTransformerTestcase } from './transform/extract-script'
import { utilsTestcase } from './transform/utils'

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
