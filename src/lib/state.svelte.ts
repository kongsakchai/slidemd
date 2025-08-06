class Settings {
	themes = $state<string[]>([])
	theme = $state<string>('default')
	aspectRatioLabel = $state<string>('16:9')
	aspectRatio = $state<number>(16 / 9)
	size = $state<number>(1)
	fontSize = $state<number>(16)
	width = $state<number>(1280)

	setTheme(theme: string) {
		this.theme = theme
		localStorage.setItem('slidemd:theme', theme)
		document.documentElement.setAttribute('data-theme', theme)
	}

	setAspectRatio(aspectRatio: number, label: string) {
		this.aspectRatio = aspectRatio
		this.aspectRatioLabel = label
		localStorage.setItem('slidemd:aspectRatio', JSON.stringify({ aspectRatio, label }))
	}

	loadTheme() {
		this.theme = localStorage.getItem('slidemd:theme') || 'default'
	}

	loadAspectRatio() {
		const saved = localStorage.getItem('slidemd:aspectRatio')
		if (!saved) return

		try {
			const { aspectRatio, label } = JSON.parse(saved)
			this.aspectRatio = aspectRatio
			this.aspectRatioLabel = label
		} catch (e) {
			console.error('Failed to parse aspect ratio from localStorage', e)
			localStorage.removeItem('slidemd:aspectRatio')
		}
	}
}

export const settings = new Settings()
