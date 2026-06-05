import 'mdast'
import 'mdast-util-from-markdown'
import 'micromark-util-types'

import { Attribute } from './types'

declare module 'micromark-util-types' {
	interface TokenTypeMap {
		highlightSequenceTemp: 'highlightSequenceTemp'
		highlightSequence: 'highlightSequence'
		highlight: 'highlight'

		subscriptSequenceTemp: 'subscriptSequenceTemp'
		subscriptSequence: 'subscriptSequence'
		subscript: 'subscript'

		superscriptSequenceTemp: 'superscriptSequenceTemp'
		superscriptSequence: 'superscriptSequence'
		superscript: 'superscript'

		container: 'container'
		containerName: 'containerName'
		containerSequence: 'containerSequence'
		containerContent: 'containerContent'

		attributeBlock: 'attributeBlock'
		attributeBlockSequence: 'attributeBlockSequence'

		attribute: 'attribute'
		attributeSequence: 'attributeSequence'
		attributeKey: 'attributeKey'
		attributeValue: 'attributeValue'
		attributeClass: 'attributeClass'
		attributeID: 'attributeID'
		attributeEqual: 'attributeEqual'

		temp: 'temp'
	}
}

declare module 'mdast' {
	interface RootContentMap {
		highlight: {
			type: 'highlight'
			children: import('mdast').RootContentMap[]
			data: {
				hName: 'mark'
			}
		}
		sub: {
			type: 'sub'
			children: import('mdast').RootContentMap[]
			data: {
				hName: 'sub'
			}
		}
		sup: {
			type: 'sup'
			children: import('mdast').RootContentMap[]
			data: {
				hName: 'sup'
			}
		}
		attributeBlock: {
			type: 'attributeBlock'
			value: ''
			attr: Attribute
		}
		container: {
			type: 'container'
			children: import('mdast').RootContentMap[]
			data: {
				attrs: string
				hName: string
			}
		}
	}
}

declare module 'mdast-util-from-markdown' {
	interface CompileData {
		attr: Attribute
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		store: Record<string, any>
	}
}
