import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { classifyCharacter } from 'micromark-util-classify-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { handleResolveAll } from './utils.js'

// Tokenize

const subscriptTokenizer = {
	name: 'subscript',
	tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State) {
		const { previous, events } = this
		let size = 0

		function start(code: Code) {
			if (previous === codes.tilde && events.at(-1)?.[1].type !== types.characterEscape) {
				return nok(code)
			}
			effects.enter('subscriptSequenceTemp')
			return more(code)
		}

		function more(code: Code) {
			if (code === codes.tilde) {
				if (size >= 1) return nok(code)
				effects.consume(code)
				size++
				return more
			}

			const token = effects.exit('subscriptSequenceTemp')
			const before = classifyCharacter(previous)
			const after = classifyCharacter(code)

			token._open = !after || (after === constants.characterGroupPunctuation && Boolean(before))
			token._close = !before || (before === constants.characterGroupPunctuation && Boolean(after))

			return ok(code)
		}

		return start
	},
	resolveAll: resolveAllSubscript
}

export const subscript: Extension = {
	text: { [codes.tilde]: subscriptTokenizer },
	insideSpan: { null: [subscriptTokenizer] },
	attentionMarkers: { null: [codes.tilde] }
}

// Resolve all

function resolveAllSubscript(events: Event[], context: TokenizeContext): Event[] {
	let close = -1
	while (++close < events.length) {
		const closeEvent = events[close]

		const isCloseSequence =
			closeEvent[0] === 'enter' && closeEvent[1].type === 'subscriptSequenceTemp' && closeEvent[1]._close

		if (!isCloseSequence) continue

		for (let open = close - 1; open > 0; open--) {
			const openEvent = events[open]

			const isOpenSequence =
				openEvent[0] === 'exit' && openEvent[1].type === 'subscriptSequenceTemp' && openEvent[1]._open

			if (!isOpenSequence) continue

			openEvent[1].type = 'subscriptSequence'
			closeEvent[1].type = 'subscriptSequence'

			const subscriptToken: Token = {
				type: 'subscript',
				start: { ...openEvent[1].start },
				end: { ...closeEvent[1].end }
			}

			const insideSpan = context.parser.constructs.insideSpan.null
			const resolveInside = handleResolveAll(insideSpan, events.slice(open + 1, close), context)

			const nextEvents: Event[] = [
				['enter', subscriptToken, context],
				['enter', openEvent[1], context],
				['exit', openEvent[1], context],
				...resolveInside,
				['enter', closeEvent[1], context],
				['exit', closeEvent[1], context],
				['exit', subscriptToken, context]
			]

			events.splice(open - 1, close - open + 3, ...nextEvents)
			close = open + nextEvents.length - 2
			break
		}
	}

	for (const event of events) {
		if (event[1].type === 'subscriptSequenceTemp') {
			event[1].type = 'data'
		}
	}

	return events
}

// From markdown

export const subscriptFromMarkdown: FromMarkdownExtension = {
	canContainEols: ['subscript'],
	enter: { subscript: enterSubscript },
	exit: { subscript: exitSubscript }
}

function enterSubscript(this: CompileContext, token: Token): void {
	this.enter({ type: 'sub', children: [], data: { hName: 'sub' } }, token)
}

function exitSubscript(this: CompileContext, token: Token): void {
	this.exit(token)
}
