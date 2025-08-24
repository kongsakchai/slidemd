#!/usr/bin/env node
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const [, , command, pathArg] = process.argv

const __dirname = path.resolve(import.meta.dirname, '../')
const target = path.resolve(process.cwd(), pathArg || './')

const filterContents = (str) => {
	return /^[^.].*.md$/.test(str) && /\/\./.test(str) === false
}

if (command === 'run') {
	if (!fs.existsSync(target)) {
		console.error(`❌ Path not found: ${target}`)
		process.exit(1)
	}
	console.log(`📁 Content path: ${target}`)

	const files = fs.readdirSync(target, {
		recursive: true
	})
	const markdowns = files.filter(filterContents)
	console.log(`📄 Markdown files found: ${markdowns.length}`)

	console.log('🚀 Starting development server...')
	const run = spawn('bun', ['run', 'dev'], {
		cwd: __dirname,
		stdio: 'inherit',
		env: {
			...process.env,
			SLIDEMD_CONTENT_PATH: target,
			SLIDEMD_MARKDOWN_LIST: JSON.stringify(markdowns)
		}
	})

	// Handle graceful shutdown
	process.on('SIGINT', () => {
		console.log('\n👋 Shutting down...')
		run.kill('SIGINT')
		process.exit(0)
	})

	run.on('error', (err) => {
		console.error('❌ Failed to start server:', err)
		process.exit(1)
	})
}
