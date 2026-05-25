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

// Tag Type
// Type 1: <script> <pre> <style>
// Type 2: Comment
// Type 3: Processing instructions <?...?>
// Type 4: Declarations <!...>
// Type 5: CDATA <![CDATA[...]]>
// Type 6: basic
// Type 7: complete tags <.../>, </...>, component

const HTTP_PREFIX = 'http://'
const HTTPS_PREFIX = 'https://'
const RAW_TAGS = new Set(htmlRawNames)
const BASIC_TAGS = new Set(htmlBlockNames)

const isAutoLink = (str: string) => str === HTTP_PREFIX || str === HTTPS_PREFIX

// --- Tokenizer

export const tokenizer: Construct = {
	concrete: true,
	name: 'html',
	tokenize: tokenize
}

export const htmlBlock: Extension = {
	flow: {
		[codes.lessThan]: tokenizer
	}
}

// --- Tokenize

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let tagNameBuffer: number[] = []
	let tagType = 0
	let cdataIndex = 0
	let isClosingTag = false

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
			const name = String.fromCharCode(...tagNameBuffer).toLowerCase()
			const isSlash = code === codes.slash

			if (isAutoLink(name)) {
				return nok(code)
			}

			resolveTagType(name, isSlash)

			if (isSlash) {
				effects.consume(code)
				return afterSlash
			}

			return isClosingTag ? closeTag(code) : more(code)
		}

		// Continue tag name
		if (code != null && (code === codes.dash || asciiAlphanumeric(code))) {
			tagNameBuffer.push(code)
			effects.consume(code)
			return tagName
		}

		return nok(code)
	}

	function resolveTagType(name: string, isSlash: boolean) {
		if (!isClosingTag && !isSlash && RAW_TAGS.has(name)) {
			tagType = constants.htmlRaw
			return
		}

		if (BASIC_TAGS.has(name)) {
			tagType = constants.htmlBasic
			return
		}

		tagType = constants.htmlComplete
	}

	// check end with `>`
	function afterSlash(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return beforeEnd
		}

		return nok(code)
	}

	// --- more
	function more(code: Code): State | undefined {
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
		return effects.check({ partial: true, tokenize: blankLineTokenize }, done, checkNonLazy)(code)
	}

	// check non lazy line
	// non lazy: continua
	// lazy: done
	function checkNonLazy(code: Code) {
		return effects.check({ partial: true, tokenize: nonLazyTokenize }, startNextLine, done)(code)
	}

	function startNextLine(code: Code) {
		effects.enter(types.lineEnding)
		effects.consume(code)
		effects.exit(types.lineEnding)
		return checkNextLine
	}

	function checkNextLine(code: Code) {
		if (markdownLineEnding(code) || code === codes.eof) {
			return checkNonLazy(code)
		}

		effects.enter(types.htmlFlowData)
		return more(code)
	}
}

function blankLineTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	return start

	function start(code: Code) {
		if (!markdownLineEnding(code)) {
			return nok(code)
		}

		effects.enter(types.lineEnding)
		effects.consume(code)
		effects.exit(types.lineEnding)

		return next
	}

	function next(code: Code) {
		if (!markdownSpace(code)) {
			return end(code)
		}

		effects.enter(types.linePrefix)
		return consumeSpace(code)
	}

	function consumeSpace(code: Code) {
		if (!markdownSpace(code)) {
			effects.exit(types.linePrefix)
			return end(code)
		}

		effects.consume(code)
		return consumeSpace
	}

	function end(code: Code) {
		return code === codes.eof || markdownLineEnding(code) ? ok(code) : nok(code)
	}
}

function nonLazyTokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	const end = (code: Code) => {
		return this.parser.lazy[this.now().line] ? nok(code) : ok(code)
	}

	return start

	function start(code: Code) {
		if (!markdownLineEnding(code)) {
			return nok(code)
		}

		effects.enter(types.lineEnding)
		effects.consume(code)
		effects.exit(types.lineEnding)

		return end
	}
}
