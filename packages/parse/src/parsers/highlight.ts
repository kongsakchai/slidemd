import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { classifyCharacter } from 'micromark-util-classify-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

import { handleResolveAll } from './helper.js'

// Highlight extension for micromark; converts token sequences of `==` into highlight tokens
const tokenizer = {
	name: 'highlight',
	tokenize: tokenize, // tokenizer for `==` sequences
	resolveAll: resolveAllHighlight // resolve all `==` sequences to highlight tokens
}

export const highlight: Extension = {
	text: { [codes.equalsTo]: tokenizer }, // trigger tokenizer when `=` is found in inline text
	insideSpan: { null: [tokenizer] }, // allow tokenizer inside spans (e.g., emphasis, strong)
	attentionMarkers: { null: [codes.equalsTo] } // allow `=` as an attention marker (e.g., for emphasis)
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const previous = this.previous
	const events = this.events

	let size = 0

	return start

	function start(code: Code) {
		// Prevent highlight if the previous character is `=` and it is not escaped (to allow for literal `=` characters)
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
}

function resolveAllHighlight(events: Event[], context: TokenizeContext) {
	let close = -1
	while (++close < events.length) {
		// find close
		// <enter>highlightSequenceTemp<exit>(open) ..some text... (close)<enter>highlightSequenceTemp<exit>
		if (
			events[close][0] === 'enter' &&
			events[close][1].type === 'highlightSequenceTemp' &&
			events[close][1]._close
		) {
			// fide open
			for (let open = close - 1; open > 0; open--) {
				// find open
				if (
					events[open][0] === 'exit' &&
					events[open][1].type === 'highlightSequenceTemp' &&
					events[open][1]._open
				) {
					events[open][1].type = 'highlightSequence'
					events[close][1].type = 'highlightSequence'

					const highlightToken: Token = {
						type: 'highlight',
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
		if (event[1].type === 'highlightSequenceTemp') {
			event[1].type = 'data'
		}
	}

	return events
}

// FromMarkdown extension to convert highlight tokens into MDAST nodes
export const highlightFromMarkdown: FromMarkdownExtension = {
	canContainEols: ['highlight'],
	enter: { highlight: enterToken },
	exit: { highlight: exitToken }
}

function enterToken(this: CompileContext, token: Token) {
	this.enter(
		{
			type: 'highlight',
			children: [],
			data: {
				hName: 'mark'
			}
		},
		token
	)
}

function exitToken(this: CompileContext, token: Token) {
	this.exit(token)
}
