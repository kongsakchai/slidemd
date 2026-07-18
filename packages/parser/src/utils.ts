export function asString(v: unknown, defaultVal?: string): string | undefined {
	return typeof v === 'string' ? v : defaultVal
}
