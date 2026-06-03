import 'mdast'
import 'mdast-util-to-hast'

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
		attribute: 'attribute'
		container: 'container'
		containerName: 'containerName'
		containerSequence: 'containerSequence'
		containerAttribute: 'containerAttribute'
		containerContent: 'containerContent'
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
		attribute: {
			type: 'attribute'
			value: string
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
