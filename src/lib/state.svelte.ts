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

	setFontSize(fontSize: number) {
		this.fontSize = fontSize
		localStorage.setItem('slidemd:fontSize', fontSize.toString())
	}

	setWidth(width: number) {
		this.width = width
		localStorage.setItem('slidemd:width', width.toString())
	}

	setSize(size: number) {
		this.size = size
		localStorage.setItem('slidemd:size', size.toString())
	}

	load() {
		this.theme = localStorage.getItem('slidemd:theme') || 'default'

		const saved = localStorage.getItem('slidemd:aspectRatio')
		if (saved) {
			try {
				const { aspectRatio, label } = JSON.parse(saved)
				this.aspectRatio = aspectRatio
				this.aspectRatioLabel = label
			} catch (e) {
				console.error('Failed to parse aspect ratio from localStorage', e)
				localStorage.removeItem('slidemd:aspectRatio')
			}
		}

		const fontSize = localStorage.getItem('slidemd:fontSize')
		if (fontSize) {
			this.fontSize = parseInt(fontSize, 10)
		}

		const width = localStorage.getItem('slidemd:width')
		if (width) {
			this.width = parseInt(width, 10)
		}

		const size = localStorage.getItem('slidemd:size')
		if (size) {
			this.size = parseFloat(size)
		}
	}
}

export const settings = new Settings()
