import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { classifyCharacter } from 'micromark-util-classify-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { handleResolveAll } from './utils.js'

// Tokenize

const highlightTokenizer: Construct = {
	name: 'highlight',
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
		const { previous, events } = this
		let size = 0

		function start(code: Code) {
			if (previous === codes.equalsTo && events.at(-1)?.[1].type !== types.characterEscape) {
				return nok(code)
			}
			effects.enter('highlightSequenceTemp')
			return more(code)
		}

		function more(code: Code) {
			if (code === codes.equalsTo) {
				if (size > 1) return nok(code)
				size++
				effects.consume(code)
				return more
			}
			if (size < 2) return nok(code)

			const token = effects.exit('highlightSequenceTemp')

			// classifyCharacter return: undefined (character) | 1 (whitespace of eof) | 2 (punctuation)
			const before = classifyCharacter(previous)
			const after = classifyCharacter(code)

			// support commonmark spec
			token._open = !after || (after === constants.characterGroupPunctuation && Boolean(before))
			token._close = !before || (before === constants.characterGroupPunctuation && Boolean(after))

			return ok(code)
		}

		return start
	},
	resolveAll: resolveAllHighlight
}

export const highlight: Extension = {
	text: { [codes.equalsTo]: highlightTokenizer },
	insideSpan: { null: [highlightTokenizer] },
	attentionMarkers: { null: [codes.equalsTo] }
}

function resolveAllHighlight(events: Event[], context: TokenizeContext): Event[] {
	let close = -1
	while (++close < events.length) {
		const closeEvent = events[close]

		const isCloseSequence =
			closeEvent[0] === 'enter' && closeEvent[1].type === 'highlightSequenceTemp' && closeEvent[1]._close

		if (!isCloseSequence) continue

		for (let open = close - 1; open > 0; open--) {
			const openEvent = events[open]

			const isOpenSequence =
				openEvent[0] === 'exit' && openEvent[1].type === 'highlightSequenceTemp' && openEvent[1]._open

			if (!isOpenSequence) continue

			openEvent[1].type = 'highlightSequence'
			closeEvent[1].type = 'highlightSequence'

			const highlightToken: Token = {
				type: 'highlight',
				start: { ...openEvent[1].start },
				end: { ...closeEvent[1].end }
			}

			const insideSpan = context.parser.constructs.insideSpan.null
			const resolveInside = handleResolveAll(insideSpan, events.slice(open + 1, close), context)

			const nextEvents: Event[] = [
				['enter', highlightToken, context],
				['enter', openEvent[1], context],
				['exit', openEvent[1], context],
				...resolveInside,
				['enter', closeEvent[1], context],
				['exit', closeEvent[1], context],
				['exit', highlightToken, context]
			]

			events.splice(open - 1, close - open + 3, ...nextEvents)
			close = open + nextEvents.length - 2
			break
		}
	}

	for (const event of events) {
		if (event[1].type === 'highlightSequenceTemp') {
			event[1].type = 'data'
		}
	}

	return events
}

// From markdown

export const highlightFromMarkdown: FromMarkdownExtension = {
	canContainEols: ['highlight'],
	enter: { highlight: enterHighlight },
	exit: { highlight: exitHighlight }
}

function enterHighlight(this: CompileContext, token: Token) {
	this.enter({ type: 'highlight', children: [], data: { hName: 'mark' } }, token)
}

function exitHighlight(this: CompileContext, token: Token) {
	this.exit(token)
}
