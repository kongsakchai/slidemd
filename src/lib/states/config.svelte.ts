/* eslint-disable @typescript-eslint/no-explicit-any */
import { browser } from '$app/environment'

import type { SlideConfig } from '$lib/types'

export const defualtSlideConfig: SlideConfig = {
	theme: 'default',
	aspect: '16:9',
	scale: 1,
	fontSize: 16,
	size: 1280,
	dark: false
}

export const slideConfig = $state<SlideConfig>(defualtSlideConfig)

export const loadSlideConfig = () => {
	if (browser) {
		const configStr = localStorage.getItem('slidemd:config')
		if (configStr) {
			const data = JSON.parse(configStr) as Record<string, any>
			Object.assign(slideConfig, data)
		}
	}
}

export const saveSlideConfig = () => {
	if (browser) {
		localStorage.setItem('slidemd:config', JSON.stringify(slideConfig))
	}
}
