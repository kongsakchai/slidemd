import {
	asciiAlpha,
	asciiAlphanumeric,
	markdownLineEnding,
	markdownLineEndingOrSpace,
	markdownSpace
} from 'micromark-util-character'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

// --- Tokenizer

export const tokenizer: Construct = {
	name: 'html-text',
	tokenize: tokenize
}

export const htmlText: Extension = {
	text: {
		[codes.lessThan]: tokenizer
	}
}

// --- Tokenize

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const markers: Code[] = []
	const latestMarker = () => (markers.length == 0 ? null : markers[markers.length - 1])

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
				return startTagName
		}

		return startTagName(code)
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
		if (code === prefix.charCodeAt(cdataIndex++)) {
			effects.consume(code)
			return cdataIndex === prefix.length ? more : openCData
		}

		return nok(code)
	}

	// tag name
	function startTagName(code: Code) {
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
			return endTagName(code)
		}

		// Continue tag name
		if (code != null && (code === codes.dash || asciiAlphanumeric(code))) {
			effects.consume(code)
			return tagName
		}

		return nok(code)
	}

	function endTagName(code: Code) {
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

		if (
			code === codes.quotationMark ||
			code === codes.apostrophe ||
			code === codes.graveAccent ||
			code === codes.leftCurlyBrace
		) {
			return checkMarker(code)
		}

		if (markdownLineEnding(code)) {
			effects.exit(types.htmlTextData)
			effects.enter(types.lineEnding)
			effects.consume(code)
			effects.exit(types.lineEnding)
			return startNextLine
		}

		effects.consume(code)
		return more
	}

	function checkMarker(code: Code) {
		const inQoute =
			latestMarker() === codes.quotationMark ||
			latestMarker() === codes.apostrophe ||
			latestMarker() === codes.graveAccent

		const currentIsQoute = code === codes.quotationMark || code === codes.apostrophe || code === codes.graveAccent

		if (latestMarker() === code) {
			markers.pop()
		} else if (inQoute && !currentIsQoute) {
			markers.push(code)
		} else if (!inQoute) {
			markers.push(code)
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

	function startNextLine(code: Code) {
		if (markdownSpace(code)) {
			effects.enter(types.linePrefix)
			effects.consume(code)
			return consumeSpace
		}

		effects.enter(types.htmlTextData)
		return more(code)
	}

	function consumeSpace(code: Code) {
		if (!markdownSpace(code)) {
			effects.exit(types.linePrefix)
			return startNextLine(code)
		}

		effects.consume(code)
		return consumeSpace
	}

	// done
	function done(code: Code) {
		effects.exit(types.htmlTextData)
		effects.exit(types.htmlText)
		return ok(code)
	}
}
