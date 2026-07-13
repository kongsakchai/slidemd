function createThemeState() {
	let mode = $state('')

	mode = localStorage.getItem('slidemd.mode') || 'light'
	if (mode === 'dark' && !document.documentElement.classList.contains('dark')) {
		document.documentElement.classList.add('dark')
	}

	function toggleMode() {
		document.documentElement.classList.toggle('dark')
		mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
		localStorage.setItem('slidemd.mode', mode)
	}

	return {
		get mode() {
			return mode
		},
		toggleMode
	}
}

export const themeState = createThemeState()
