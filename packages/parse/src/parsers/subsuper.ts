import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'
import { handleResolveAll } from './helper'

// Subscript extension for micromark; converts token sequences of `~` into subscript tokens
export const subscript = (): Extension => {
	const tokenizer = {
		name: 'subscript',
		tokenize: tokenizerSubscript,
		resolveAll: resolveAllSubscript
	}

	return {
		text: { [codes.tilde]: tokenizer }, // trigger tokenizer when `~` is found in inline text
		insideSpan: { null: [tokenizer] }, // allow tokenizer inside spans (e.g., emphasis, strong)
		attentionMarkers: { null: [codes.tilde] } // allow `~` as an attention marker (e.g., for emphasis)
	}

	function tokenizerSubscript(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		const previous = this.previous
		const events = this.events
		let size = 0
		return start

		function start(code: Code) {
			// Prevent subscript if the previous character is `~` and it is not escaped (to allow for literal `~` characters)
			if (previous === codes.tilde && events[events.length - 1][1].type !== types.characterEscape) {
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

			effects.exit('subscriptSequenceTemp')
			return ok(code)
		}
	}

	function resolveAllSubscript(events: Event[], context: TokenizeContext) {
		for (let open = 0; open < events.length; open++) {
			// find open
			// <enter>subscriptSequenceTemp<exit>(open) ..some text... <enter>subscriptSequenceTemp<exit>(close)
			if (events[open][0] === 'exit' && events[open][1].type === 'subscriptSequenceTemp') {
				// walk next
				for (let close = open + 1; close < events.length; close++) {
					// find close
					if (events[close][0] === 'enter' && events[close][1].type === 'subscriptSequenceTemp') {
						events[open][1].type = 'subscriptSequence'
						events[close][1].type = 'subscriptSequence'

						const highlightToken: Token = {
							type: 'subscript',
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
			if (events[index][1].type === 'subscriptSequenceTemp') {
				events[index][1].type = 'data'
			}
		}

		return events
	}
}

// FromMarkdown extension to convert subscript tokens into MDAST nodes
export const subscriptFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['subscript'],
		enter: { subscript: enterToken },
		exit: { subscript: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
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

	function exitToken(this: CompileContext, token: Token) {
		this.exit(token)
	}
}

// Subscript extension for micromark; converts token sequences of `^` into superscript tokens
export const superscript = (): Extension => {
	const tokenizer = {
		name: 'superscript',
		tokenize: tokenizerSuperscript,
		resolveAll: resolveAllSuperscript
	}

	return {
		text: { [codes.caret]: tokenizer }, // trigger tokenizer when `^` is found in inline text
		insideSpan: { null: [tokenizer] }, // allow tokenizer inside spans (e.g., emphasis, strong)
		attentionMarkers: { null: [codes.caret] } // allow `^` as an attention marker (e.g., for emphasis)
	}

	function tokenizerSuperscript(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		const previous = this.previous
		const events = this.events
		let size = 0
		return start

		function start(code: Code) {
			// Prevent superscript if the previous character is `^` and it is not escaped (to allow for literal `^` characters)
			if (previous === codes.caret && events[events.length - 1][1].type !== types.characterEscape) {
				return nok(code)
			}

			effects.enter('superscriptSequenceTemp')
			return more(code)
		}

		function more(code: Code) {
			if (code === codes.caret) {
				if (size >= 1) return nok(code)

				effects.consume(code)
				size++
				return more
			}

			effects.exit('superscriptSequenceTemp')
			return ok(code)
		}
	}

	function resolveAllSuperscript(events: Event[], context: TokenizeContext) {
		for (let open = 0; open < events.length; open++) {
			// find open
			// <enter>superscriptSequenceTemp<exit>(open) ..some text... <enter>superscriptSequenceTemp<exit>(close)
			if (events[open][0] === 'exit' && events[open][1].type === 'superscriptSequenceTemp') {
				// walk next
				for (let close = open + 1; close < events.length; close++) {
					// find close
					if (events[close][0] === 'enter' && events[close][1].type === 'superscriptSequenceTemp') {
						events[open][1].type = 'superscriptSequence'
						events[close][1].type = 'superscriptSequence'

						const highlightToken: Token = {
							type: 'superscript',
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
			if (events[index][1].type === 'superscriptSequenceTemp') {
				events[index][1].type = 'data'
			}
		}

		return events
	}
}

// FromMarkdown extension to convert superscript tokens into MDAST nodes
export const superscriptFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['superscript'],
		enter: { superscript: enterToken },
		exit: { superscript: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		this.enter(
			{
				type: 'sup',
				children: [],
				data: {
					hName: 'sup'
				}
			},
			token
		)
	}

	function exitToken(this: CompileContext, token: Token) {
		this.exit(token)
	}
}
