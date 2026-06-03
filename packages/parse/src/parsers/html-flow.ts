import {
	asciiAlpha,
	asciiAlphanumeric,
	markdownLineEnding,
	markdownLineEndingOrSpace,
	markdownSpace
} from 'micromark-util-character'
import { htmlBlockNames, htmlRawNames } from 'micromark-util-html-tag-name'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

import { blankLinePartialTokenizer, nonLazyPartialTokenizer } from './line.js'

// Tag Type
// Type 1: <script> <pre> <style>
// Type 2: Comment
// Type 3: Processing instructions <?...?>
// Type 4: Declarations <!...>
// Type 5: CDATA <![CDATA[...]]>
// Type 6: basic
// Type 7: complete tags <.../>, </...>, component

const RAW_TAGS = new Set(htmlRawNames)
const BASIC_TAGS = new Set(htmlBlockNames)

// --- Tokenizer

export const htmlFlowTokenizer: Construct = {
	concrete: true,
	name: 'html',
	tokenize: tokenize
}

export const htmlFlow: Extension = {
	flow: {
		[codes.lessThan]: htmlFlowTokenizer
	}
}

// --- Tokenize

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let tagNameBuffer: number[] = []
	let tagType = 0
	let cdataIndex = 0
	let isClosingTag = false

	const isInterrupt = () => this.interrupt
	const isLazy = () => this.parser.lazy[this.now().line]

	return start

	function start(code: Code): State | undefined {
		effects.enter(types.htmlFlow)
		effects.enter(types.htmlFlowData)
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
		if (code === prefix.codePointAt(cdataIndex++)) {
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

		tagNameBuffer = [code]
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
			return endTagName(code)
		}

		// Continue tag name
		if (code != null && (code === codes.dash || asciiAlphanumeric(code))) {
			tagNameBuffer.push(code)
			effects.consume(code)
			return tagName
		}

		return nok(code)
	}

	function endTagName(code: Code) {
		const isSlash = code === codes.slash
		const name = String.fromCodePoint(...tagNameBuffer).toLowerCase()

		if (!isClosingTag && !isSlash && RAW_TAGS.has(name)) {
			tagType = constants.htmlRaw
			return more(code)
		}

		if (BASIC_TAGS.has(name)) {
			tagType = constants.htmlBasic
		} else {
			tagType = constants.htmlComplete

			// Do not support complete HTML when interrupting.
			if (isInterrupt() && !isLazy()) {
				return nok(code)
			}
		}

		if (isSlash) {
			effects.consume(code)
			return completeEnd
		}

		return isClosingTag ? completeClosingTag(code) : more(code)
	}

	// check end with `>`
	function completeEnd(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return isInterrupt() ? ok : beforeEnd
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
		if (isInterrupt()) {
			return ok(code)
		}

		if (code === codes.lessThan && tagType === constants.htmlRaw) {
			effects.consume(code)
			return closeRawTag
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
			return beforeEnd
		}

		if (code === codes.rightSquareBracket && tagType === constants.htmlCdata) {
			effects.consume(code)
			return closeCData
		}

		if (markdownLineEnding(code) && (tagType === constants.htmlBasic || tagType === constants.htmlComplete)) {
			effects.exit(types.htmlFlowData)
			return checkBlankLine(code)
		}

		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit(types.htmlFlowData)
			return checkNonLazy(code)
		}

		effects.consume(code)
		return more
	}

	// close raw tag & read tag name
	function closeRawTag(code: Code) {
		if (code === codes.slash) {
			isClosingTag = true
			effects.consume(code)
			return startTagName
		}

		return more(code)
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
			return beforeEnd
		}

		if (code === codes.dash && tagType === constants.htmlComment) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	// before end consume all characters
	function beforeEnd(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit(types.htmlFlowData)
			return done(code)
		}

		effects.consume(code)
		return beforeEnd
	}

	// done
	function done(code: Code) {
		effects.exit(types.htmlFlow)
		return ok(code)
	}

	// --- Multiple-line

	// check blank line for normal tag
	// blank line: done
	// non blank line: check non lazy
	function checkBlankLine(code: Code) {
		return effects.check(blankLinePartialTokenizer, done, checkNonLazy)(code)
	}

	// check non lazy line
	// non lazy: continua
	// lazy: done
	function checkNonLazy(code: Code) {
		return effects.attempt(nonLazyPartialTokenizer, checkNextLine, done)(code)
	}

	function checkNextLine(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			return checkNonLazy(code)
		}

		effects.enter(types.htmlFlowData)
		return more(code)
	}
}
