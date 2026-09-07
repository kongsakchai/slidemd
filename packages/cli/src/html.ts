export function renderAppHTML(module: string): string {
	return [
		`<!doctype html>`,
		`<html lang="en">`,
		`<head>`,
		`<meta charset="UTF-8" />`,
		// `<link rel="icon" type="image/svg+xml" href="/icon.png" />`,
		`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
		`<title>Slide MD</title>`,
		`</head>`,
		`<body>`,
		`<div id="app"></div>`,
		`<script type="module">`,
		`import { mount } from 'svelte'`,
		`import '@slide:app.css'`,
		`import App from '${module}'`,
		`const appElement = document.getElementById('app')`,
		`if (appElement) mount(App, { target: appElement })`,
		`</script>`,
		`</body>`,
		`</html>`
	].join('\n')
}

export const html404 = [
	`<!doctype html>`,
	`<html lang="en">`,
	`<head>`,
	`<meta charset="UTF-8" />`,
	`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
	`<title>Slide MD</title>`,
	`</head>`,
	`<h1>404 — slide not found</h1>`,
	`<body>`,
	`</body>`,
	`</html>`
].join('\n')
