export type AttributeValue = string | number | boolean | null | undefined | (string | number | boolean)[]

export interface Attribute {
	[key: string]: AttributeValue
}

export interface Directive {
	[key: string]: Attribute[string] | Attribute | Attribute[]
}
