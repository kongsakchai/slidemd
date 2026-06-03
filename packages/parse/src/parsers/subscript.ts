import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { classifyCharacter } from 'micromark-util-classify-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { handleResolveAll } from './uitls.js'

// Subscript extension for micromark; converts token sequences of `~` into subscript tokens
export const subscriptTokenizer = {
	name: 'subscript',
	tokenize: subscriptTokenize,
	resolveAll: resolveAllSubscript
}

export const subscript: Extension = {
	text: { [codes.tilde]: subscriptTokenizer }, // trigger tokenizer when `~` is found in inline text
	insideSpan: { null: [subscriptTokenizer] }, // allow tokenizer inside spans (e.g., emphasis, strong)
	attentionMarkers: { null: [codes.tilde] } // allow `~` as an attention marker (e.g., for emphasis)
}

function subscriptTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const previous = this.previous
	const events = this.events
	let size = 0
	return start

	function start(code: Code) {
		// Prevent subscript if the previous character is `~` and it is not escaped (to allow for literal `~` characters)
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

		// classifyCharacter return: undefined (character) | 1 (whitespace of eof) | 2 (punctuation)
		const before = classifyCharacter(previous)
		const after = classifyCharacter(code)

		// support commonmark spec
		token._open = !after || (after === constants.characterGroupPunctuation && Boolean(before))
		token._close = !before || (before === constants.characterGroupPunctuation && Boolean(after))

		return ok(code)
	}
}

function resolveAllSubscript(events: Event[], context: TokenizeContext) {
	let close = -1
	while (++close < events.length) {
		// find close
		// <enter>subscriptSequenceTemp<exit>(open) ..some text... <enter>subscriptSequenceTemp<exit>(close)
		if (
			events[close][0] === 'enter' &&
			events[close][1].type === 'subscriptSequenceTemp' &&
			events[close][1]._close
		) {
			// fide open
			for (let open = close - 1; open > 0; open--) {
				// find close
				if (
					events[open][0] === 'exit' &&
					events[open][1].type === 'subscriptSequenceTemp' &&
					events[open][1]._open
				) {
					events[open][1].type = 'subscriptSequence'
					events[close][1].type = 'subscriptSequence'

					const highlightToken: Token = {
						type: 'subscript',
						start: { ...events[open][1].start },
						end: { ...events[close][1].end }
					}

					const insideSpan = context.parser.constructs.insideSpan.null
					const resolveInside = handleResolveAll(insideSpan, events.slice(open + 1, close), context)

					const nextEvents: Array<Event> = [
						['enter', highlightToken, context],
						['enter', events[open][1], context],
						['exit', events[open][1], context],
						// ['enter', text, context],
						...resolveInside,
						// ['exit', text, context],
						['enter', events[close][1], context],
						['exit', events[close][1], context],
						['exit', highlightToken, context]
					]
					// <enter>(open), <exit>(open),something,(close)<enter>, (close)<exit>
					// <exit>(open) - (close)<enter> = 2; <exit>(open), something
					// close - open + <enter>(open) + (close)<enter> + (close)<exit>
					events.splice(open - 1, close - open + 3, ...nextEvents)

					// jump to current
					// 2 is offset of old event: <enter>(open), <exit>(open)
					close = open + nextEvents.length - 2
					break
				}
			}
		}
	}

	// reset type
	for (const event of events) {
		if (event[1].type === 'subscriptSequenceTemp') {
			event[1].type = 'data'
		}
	}

	return events
}

// FromMarkdown extension to convert subscript tokens into MDAST nodes
export const subscriptFromMarkdown: FromMarkdownExtension = {
	canContainEols: ['subscript'],
	enter: { subscript: enterSubscriptToken },
	exit: { subscript: exitSubscriptToken }
}

function enterSubscriptToken(this: CompileContext, token: Token) {
	this.enter(
		{
			type: 'sub',
			children: [],
			data: {
				hName: 'sub'
			}
		},
		token
	)
}

function exitSubscriptToken(this: CompileContext, token: Token) {
	this.exit(token)
}
