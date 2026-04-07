import 'mdast'
import 'micromark-util-types'

declare module 'micromark-util-types' {
	interface TokenTypeMap {
		highlightSequenceTemp: {}
		highlightSequence: {}
		highlight: {}
		subscriptSequenceTemp: {}
		subscriptSequence: {}
		subscript: {}
		superscriptSequenceTemp: {}
		superscriptSequence: {}
		superscript: {}
		inlineCode: {}
	}
}

declare module 'mdast' {
	interface RootContentMap {
		highlight: {
			type: 'highlight'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'mark'
			}
		}
		sub: {
			type: 'sub'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'sub'
			}
		}
		sup: {
			type: 'sup'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'sup'
			}
		}
		codeContainer: {
			type: 'codeContainer'
			data: {
				hName: 'div'
				hProperties: Record<string, any>
			}
			children: import('mdast').PhrasingContent[]
		}
	}
}
