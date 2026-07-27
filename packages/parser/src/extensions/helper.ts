import { resolveAll as micromarkResolveAll } from 'micromark-util-resolve-all'
import type { Construct, Event, TokenizeContext } from 'micromark-util-types'

export const handleResolveAll = (
	constructs: Pick<Construct, 'resolveAll'>[] | undefined,
	events: Event[],
	context: TokenizeContext
) => {
	return constructs ? micromarkResolveAll(constructs, events, context) : []
}
