const limitValue = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const panzoom = (node: HTMLElement, getZoom: () => number) => {
	const parent = node.parentElement || document.body

	let limitX = 0
	let limitY = 0

	let transitionX = 0
	let transitionY = 0

	let enable = false
	let endY = false
	let hold = false

	$effect(() => {
		const zoom = getZoom()
		enable = zoom !== 1

		limitX = (node.offsetWidth * zoom - parent.offsetWidth) / (2 * zoom)
		limitY = (node.offsetHeight * zoom - parent.offsetHeight) / (2 * zoom)

		if (enable) {
			move(0, 0)
		} else {
			node.style.transform = ''
		}

		for (const child of node.children) {
			const el = child as HTMLElement
			el.style.pointerEvents = enable ? 'none' : ''
			el.style.userSelect = enable ? 'none' : ''
		}
	})

	const onHold = () => {
		if (!enable) return
		hold = true
	}
	const exitOnHold = () => {
		hold = false
	}
	const move = (x: number, y: number) => {
		transitionX = limitValue(transitionX + x, -limitX, limitX)
		transitionY = limitValue(transitionY + y, -limitY, limitY)
		endY = transitionY == -limitY || transitionY === limitY
		node.style.transform = `translate(${transitionX}px, ${transitionY}px)`
	}

	const pointerPan = (e: PointerEvent) => {
		if (!enable || !hold) return
		e.preventDefault()
		move(e.movementX, e.movementY)
	}

	const wheelPan = (e: WheelEvent) => {
		if (!enable) return
		if (!endY || e.deltaX !== 0) e.preventDefault()
		move(-e.deltaX, -e.deltaY)
	}

	node.addEventListener('pointermove', pointerPan)
	node.addEventListener('wheel', wheelPan)
	node.addEventListener('pointerdown', onHold)
	node.addEventListener('pointerup', exitOnHold)
	node.addEventListener('pointerleave', exitOnHold)

	return {
		destroy() {
			node.removeEventListener('pointermove', pointerPan)
			node.removeEventListener('wheel', wheelPan)
			node.removeEventListener('pointerdown', onHold)
			node.removeEventListener('pointerup', exitOnHold)
			node.removeEventListener('pointerleave', exitOnHold)
		}
	}
}
