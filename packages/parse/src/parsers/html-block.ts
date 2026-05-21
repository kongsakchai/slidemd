import { asciiAlpha, asciiAlphanumeric, markdownLineEnding, markdownLineEndingOrSpace } from 'micromark-util-character'
import { htmlBlockNames, htmlRawNames } from 'micromark-util-html-tag-name'
import { codes, constants, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, State, TokenizeContext } from 'micromark-util-types'

// Tag Type
// Type 1: <script> <pre> <style>
// Type 2: Comment
// Type 3: Processing instructions <?...?>
// Type 4: Declarations <!...>
// Type 5: CDATA <![CDATA[...]]>
// Type 6: basic
// Type 7: complete tags <.../>, </...>, component

const httpPrefix = 'http://'
const httpsPrefix = 'https://'

const isAutoLink = (str: string) => str === httpPrefix || str === httpsPrefix

export const htmlFlow: Construct = {
	concrete: true,
	name: 'html',
	tokenize: tokenize
}

function tokenize(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	let tagType = 0
	let cdataIndex = 0
	let buffer = ''
	let isClossingTag = false

	// const self = this

	return start

	function start(code: Code): State | undefined {
		effects.enter(types.htmlFlow)
		effects.enter(types.htmlFlowData)
		effects.consume(code)
		return open
	}

	// check the first character after `<` to determine the block type
	function open(code: Code): State | undefined {
		// 2, 4 & 5
		if (code === codes.exclamationMark) {
			effects.consume(code)
			return openWithExclamationMark
		}

		// 3
		if (code === codes.questionMark) {
			tagType = constants.htmlInstruction
			effects.consume(code)
			return more
		}

		// case closed tag name
		if (code === codes.slash) {
			isClossingTag = true
			effects.consume(code)
			return startTagName
		}

		// 1 & 6 & 7 & nok
		return startTagName(code)
	}

	// For blocks starting with `<!`, determine if it's a comment, CDATA, declaration, or something else based on the next characters
	function openWithExclamationMark(code: Code) {
		if (code === codes.dash) {
			tagType = constants.htmlComment
			effects.consume(code)
			return openComment
		}
		if (code === codes.leftSquareBracket) {
			cdataIndex = 0
			tagType = constants.htmlCdata
			effects.consume(code)
			return openCData
		}
		if (asciiAlpha(code)) {
			tagType = constants.htmlDeclaration
			effects.consume(code)
			return more
		}

		return nok(code)
	}

	// For comment blocks, look for the closing `<!--` sequence
	function openComment(code: Code) {
		if (code === codes.dash) {
			effects.consume(code)
			return more
		}

		return nok(code)
	}

	// For comment blocks, look for the closing `-->` sequence
	function closeComment(code: Code) {
		if (code === codes.dash) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	// For CDATA blocks, look for the closing `<![CDATA[` sequence
	function openCData(code: Code) {
		const prefix = constants.cdataOpeningString
		if (code === prefix.charCodeAt(cdataIndex++)) {
			effects.consume(code)
			return cdataIndex === prefix.length ? more : openCData
		}

		return nok(code)
	}

	// For CDATA blocks, look for the s `]]>` sequence
	function closeCData(code: Code) {
		if (code === codes.rightSquareBracket) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	function startTagName(code: Code) {
		if (code !== null && asciiAlpha(code)) {
			effects.consume(code)
			buffer = String.fromCharCode(code)
			return endTagName
		}

		return nok(code)
	}

	// For tag blocks, after reading the tag name, look for the closing `>` and determine if the block is complete or not based on the tag name and content
	function endTagName(code: Code) {
		if (isAutoLink(buffer)) {
			return nok(code)
		}

		// end of tag name: <div>, <div/>, <div\n, <div class="">
		if (
			code === codes.greaterThan ||
			code === codes.slash ||
			code === codes.eof ||
			markdownLineEndingOrSpace(code)
		) {
			const name = buffer.toLowerCase()
			const slash = code === codes.slash

			if (!slash && !isClossingTag && htmlRawNames.includes(name)) {
				tagType = constants.htmlRaw
				return more(code)
			}

			if (htmlBlockNames.includes(name)) {
				tagType = constants.htmlBasic
			} else if (tagType === 0) {
				tagType = constants.htmlComplete
			}

			if (slash) {
				effects.consume(code)
				return closeComplete
			}

			return isClossingTag ? closeTag(code) : more(code)
		}

		// consume tag name include alphanumberical or -
		if (code === codes.dash || asciiAlphanumeric(code)) {
			effects.consume(code)
			buffer += String.fromCharCode(code)
			return endTagName
		}

		return nok(code)
	}

	function closeRawTag(code: Code) {
		if (code === codes.slash) {
			isClossingTag = true
			effects.consume(code)
			return startTagName
		}

		return more(code)
	}

	// For all block types, keep consuming characters until the appropriate closing sequence is found, while also handling line breaks for non-inline blocks
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
			return done
		}

		if (code === codes.rightSquareBracket && tagType === constants.htmlCdata) {
			effects.consume(code)
			return closeCData
		}

		effects.consume(code)
		return more
	}

	function closeTag(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return done
		}

		// More dashes for comment case
		if (code === codes.dash && tagType === constants.htmlComment) {
			effects.consume(code)
			return closeTag
		}

		return more(code)
	}

	function closeComplete(code: Code) {
		if (code === codes.greaterThan) {
			effects.consume(code)
			return done
		}

		return nok(code)
	}

	//When closed, all characters will be consumed to the new line.
	function done(code: Code) {
		if (code === codes.eof || markdownLineEnding(code)) {
			effects.exit(types.htmlFlowData)
			effects.exit(types.htmlFlow)
			return ok(code)
		}

		effects.consume(code)
		return done
	}
}
