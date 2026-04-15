import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'
import { handleResolveAll } from './helper.js'

// Highlight extension for micromark; converts token sequences of `==` into highlight tokens
export const highlight = (): Extension => {
	const tokenizer = {
		name: 'highlight',
		tokenize: tokenizerHighlight, // tokenizer for `==` sequences
		resolveAll: resolveAllHighlight // resolve all `==` sequences to highlight tokens
	}

	return {
		text: { [codes.equalsTo]: tokenizer }, // trigger tokenizer when `=` is found in inline text
		insideSpan: { null: [tokenizer] }, // allow tokenizer inside spans (e.g., emphasis, strong)
		attentionMarkers: { null: [codes.equalsTo] } // allow `=` as an attention marker (e.g., for emphasis)
	}

	function tokenizerHighlight(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		const previous = this.previous
		const events = this.events

		let size = 0

		return start

		function start(code: Code) {
			// Prevent highlight if the previous character is `=` and it is not escaped (to allow for literal `=` characters)
			if (previous === codes.equalsTo && events[events.length - 1][1].type !== types.characterEscape) {
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

			effects.exit('highlightSequenceTemp')
			return ok(code)
		}
	}

	function resolveAllHighlight(events: Event[], context: TokenizeContext) {
		for (let open = 0; open < events.length; open++) {
			// find open
			// <enter>highlightSequenceTemp<exit>(open) ..some text... <enter>highlightSequenceTemp<exit>(close)
			if (events[open][0] === 'exit' && events[open][1].type === 'highlightSequenceTemp') {
				// walk next
				for (let close = open + 1; close < events.length; close++) {
					// find close
					if (events[close][0] === 'enter' && events[close][1].type === 'highlightSequenceTemp') {
						events[open][1].type = 'highlightSequence'
						events[close][1].type = 'highlightSequence'

						const highlightToken: Token = {
							type: 'highlight',
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[close][1].end)
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

						events.splice(open - 1, close - open + 3, ...nextEvents)

						open += nextEvents.length - 2
						break
					}
				}
			}
		}

		// reset type
		for (let index = 0; index < events.length; index++) {
			if (events[index][1].type === 'highlightSequenceTemp') {
				events[index][1].type = 'data'
			}
		}

		return events
	}
}

// FromMarkdown extension to convert highlight tokens into MDAST nodes
export const highlightFromMarkdown = (): FromMarkdownExtension => {
	return {
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
}
