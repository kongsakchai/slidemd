import { Command } from 'commander'
import * as readline from 'node:readline'

import { createServer } from './command/serv'

const program = new Command('🚀 SlideMD')

function setupKeyboardShortcuts(server: Awaited<ReturnType<typeof createServer>>) {
	// Keyboard shortcuts are only available in an interactive terminal.
	if (!process.stdin.isTTY) return

	process.stdin.resume() // default mode is pause. must set to resume for binding
	process.stdin.setEncoding('utf8')

	readline.emitKeypressEvents(process.stdin) // consume event
	process.stdin.setRawMode(true) // process event when key is pressed without enter.

	process.stdin.on('keypress', async (_input, key) => {
		if (key.ctrl && key.name === 'c') {
			process.exit(0)
		}

		switch (key.name) {
			case 'r':
				await server.restart()
				console.log('Server restarted.')
				break

			case 'q':
				console.log('Shutting down...')

				try {
					await server.close()
				} finally {
					process.exit(0)
				}
		}
	})
}

program
	.name('slidemd')
	.description('Generate presentation slides from Markdown using Svelte.')
	.version('1.0.0')
	.argument('<src>', 'Path to a slide file or slide directory.')
	.option('-p, --port <number>', 'Port number for the development server.')
	.action(async (src, options) => {
		const server = await createServer(src, options)
		setupKeyboardShortcuts(server)
	})
	.showHelpAfterError()

program.parse(process.argv)
