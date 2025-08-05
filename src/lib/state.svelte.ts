interface Settings {
	theme: string
	aspectRatioLabel: string
	aspectRatio: number
	size: number
	fontSize: number
	width: number
}

export const settings = $state<Settings>({
	theme: 'default',
	aspectRatioLabel: '16:9',
	aspectRatio: 16 / 9,
	size: 1,
	fontSize: 16,
	width: 1280
})

export const themes = $state<string[]>([])
