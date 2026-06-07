import {
	asciiAlpha,
	asciiAlphanumeric,
	markdownLineEnding,
	markdownLineEndingOrSpace,
	markdownSpace
} from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { spacePartialTokenizer } from './space.js'

const QOUTE_LIST = new Set<Code>([codes.quotationMark, codes.apostrophe, codes.graveAccent])

const isQoute = (code: Code) => QOUTE_LIST.has(code)

// --- Tokenizer

export const htmlTextTokenizer: Construct = {
	name: 'html-text',
	tokenize: tokenize
}

export const htmlText: Extension = {
	text: {
		[codes.lessThan]: htmlTextTokenizer
	}
}

// --- Tokenize

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const markers: Code[] = []
	const latestMarker = () => (markers.length == 0 ? null : markers.at(-1)!)

	let tagType = 0
	let cdataIndex = 0
	let isClosingTag = false

	return start

	function start(code: Code): State | undefined {
		effects.enter(types.htmlText)
		effects.enter(types.htmlTextData)
		effects.consume(code) // consume `<`
		return open
	}

	// Open - check after `<`
	function open(code: Code): State | undefined {
		switch (code) {
			case codes.exclamationMark:
				effects.consume(code) // consume `!`
				return openExclamationMark

			case codes.questionMark:
				tagType = constants.htmlInstruction
				effects.consume(code) // consume `?`
				return more

			case codes.slash:
				isClosingTag = true
				effects.consume(code) // consume `\`
				return openTagName
		}

		return openTagName(code)
	}

	// Type 2 / 4 / 6 - check after `<!`
	function openExclamationMark(code: Code) {
		switch (code) {
			case codes.dash:
				tagType = constants.htmlComment
				effects.consume(code) // consume `-`
				return openComment

			case codes.leftSquareBracket:
				tagType = constants.htmlCdata
				cdataIndex = 0
				effects.consume(code) // consume `[`
				return openCData
		}

		if (asciiAlpha(code)) {
			tagType = constants.htmlDeclaration
			effects.consume(code) // consume alpha
			return more
		}

		return nok(code)
	}

	// Type 2 - comment block
	function openComment(code: Code) {
		if (code === codes.dash) {
			effects.consume(code) // comsune `-`
			return more
		}

		return nok(code)
	}

	// Type 4 - cdata block
	function openCData(code: Code) {
		const prefix = constants.cdataOpeningString
		if (code === prefix.codePointAt(cdataIndex++)) {
			effects.consume(code)
			return cdataIndex === prefix.length ? more : openCData
		}

		return nok(code)
	}

	// tag name
	function openTagName(code: Code) {
		if (code === null || !asciiAlpha(code)) {
			return nok(code)
		}

		effects.consume(code) // consume character
		return tagName
	}

	// validate tag name
	function tagName(code: Code) {
		// tag end with `>`, `\`, null, space
		if (
			code === codes.greaterThan ||
			code === codes.slash ||
			code === codes.eof ||
			markdownLineEndingOrSpace(code)
		) {
			tagType = constants.htmlComplete
			return closeTagName(code)
		}

		// Continue tag name
		if (code != null && (code === codes.dash || asciiAlphanumeric(code))) {
			effects.consume(code)
			return tagName
		}

		return nok(code)
	}

	function closeTagName(code: Code) {
		if (code === codes.slash) {
			effects.consume(code)
			return completeEnd
		}

		return isClosingTag ? completeClosingTag(code) : more(code)
	}

	// check end with `>`
	function completeEnd(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return done
		}

		return nok(code)
	}

	function completeClosingTag(code: Code) {
		if (markdownSpace(code)) {
			effects.consume(code)
			return completeClosingTag
		}
		return completeEnd(code)
	}

	// --- more
	function more(code: Code): State | undefined {
		if (code === codes.eof) {
			return nok(code)
		}

		if (code === codes.dash && tagType === constants.htmlComment) {
			effects.consume(code)
			return closeComment
		}

		if (code === codes.questionMark && tagType === constants.htmlInstruction) {
			effects.consume(code)
			return closeTag
		}

		if (code === codes.greaterThan && tagType === constants.htmlDeclaration) {
			effects.consume(code)
			return done
		}

		if (code === codes.rightSquareBracket && tagType === constants.htmlCdata) {
			effects.consume(code)
			return closeCData
		}

		if (markers.length === 0 && code === codes.greaterThan && tagType === constants.htmlComplete) {
			effects.consume(code)
			return done
		}

		if (isQoute(code)) {
			return checkQoute(code)
		}

		if (code === codes.leftCurlyBrace || code === codes.rightCurlyBrace) {
			return checkScope(code)
		}

		if (markdownLineEnding(code)) {
			effects.exit(types.htmlTextData)
			effects.enter(types.lineEnding)
			effects.consume(code)
			effects.exit(types.lineEnding)
			return checkNextLine
		}

		effects.consume(code)
		return more
	}

	function checkQoute(code: Code) {
		if (code === latestMarker()) {
			markers.pop()
		} else if (!isQoute(latestMarker())) {
			markers.push(code)
		}

		effects.consume(code)
		return more
	}

	function checkScope(code: Code) {
		if (code === codes.leftCurlyBrace) {
			markers.push(code)
		} else if (latestMarker() === codes.leftCurlyBrace) {
			markers.pop()
		}

		effects.consume(code)
		return more
	}

	// close comment
	function closeComment(code: Code) {
		if (code === codes.dash) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	// close cdata
	function closeCData(code: Code) {
		if (code === codes.rightSquareBracket) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	// close tag with `<` or comment with more dashes
	function closeTag(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return done
		}

		if (code === codes.dash && tagType === constants.htmlComment) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	function checkNextLine(code: Code) {
		return effects.attempt(spacePartialTokenizer, startNextLine, startNextLine)(code)
	}

	function startNextLine(code: Code) {
		effects.enter(types.htmlTextData)
		return more(code)
	}

	// done
	function done(code: Code) {
		effects.exit(types.htmlTextData)
		effects.exit(types.htmlText)
		return ok(code)
	}
}
