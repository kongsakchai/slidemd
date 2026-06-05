import { expect, it } from 'vitest'

type Parse = (str: string) => Promise<string>

export function attributeTestcase(parse: Parse) {
	it('should return only content when attribute parser correctly', async () => {
		const file = await parse('# hello, markdown @{.title} ')
		expect(file).toEqual('<h1>hello, markdown </h1>')
	})

	it('should return all and attribute text when attribute not last token', async () => {
		const file = await parse('# hello, markdown @{.title} text')
		expect(file).toEqual('<h1>hello, markdown @{.title} text</h1>')
	})

	it('should return all when attribute invalid', async () => {
		const file = await parse('# hello, markdown @{.title')
		expect(file).toEqual('<h1>hello, markdown @{.title</h1>')
	})
}
