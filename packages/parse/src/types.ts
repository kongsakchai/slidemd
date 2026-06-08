export type AttributeValue = string | number | boolean | null | undefined | (string | number | boolean)[]

export interface Attribute {
	[key: string]: AttributeValue
}

export interface Directive {
	[key: string]: Attribute[string] | Attribute | Attribute[]
}

export interface Output {
	value: string
	style: string
	script: string
	step: number
	global: Directive
	local: Directive
}
