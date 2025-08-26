#!/usr/bin/env node
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const [, , command, pathArg, outputArg] = process.argv

const projectPath = path.resolve(import.meta.dirname, '../')
const contentPath = path.resolve(process.cwd(), pathArg || './')
const outputPath = path.resolve(process.cwd(), outputArg || './build')

export const run = (projectPath, contentPath) => {
	if (!fs.existsSync(contentPath)) {
		console.error('❌ Content path does not exist:', contentPath)
		process.exit(1)
	}

	console.log(`📁 Content path: ${contentPath}`)
	console.log('🔥 Starting development server...')

	const run = spawn('bun', ['run', 'dev'], {
		cwd: projectPath,
		stdio: 'inherit',
		env: {
			...process.env,
			SLIDEMD_PATH: contentPath
		}
	})

	// Handle graceful shutdown
	process.on('SIGINT', () => {
		console.log('Shutting down...')
		run.kill('SIGINT')
		process.exit(0)
	})

	run.on('error', (err) => {
		console.error('❌ Failed to start server:', err)
		process.exit(1)
	})
}

export const build = (projectPath, contentPath, outputPath) => {
	if (!fs.existsSync(contentPath)) {
		console.error('❌ Content path does not exist:', contentPath)
		process.exit(1)
	}

	console.log(`📁 Content path: ${contentPath}`)
	console.log(`📦 Output path: ${outputPath}`)
	console.log('🚀 Building the project...')

	const build = spawn('bun', ['run', 'build'], {
		cwd: projectPath,
		stdio: 'inherit',
		env: {
			...process.env,
			SLIDEMD_PATH: contentPath,
			SLIDEMD_OUTPUT: outputPath
		}
	})

	build.on('error', (err) => {
		console.error('❌ Build failed:', err)
		process.exit(1)
	})

	build.on('exit', (code) => {
		if (code === 0) {
			if (fs.existsSync(outputPath)) {
				fs.rmSync(outputPath, { recursive: true, force: true })
			}

			fs.renameSync(path.join(projectPath, 'build'), path.join(outputPath))
			console.log('✅ Build completed successfully.')
		} else {
			console.error(`❌ Build process exited with code ${code}.`)
			process.exit(code || 1)
		}
	})
}

if (command === 'run') {
	run(projectPath, contentPath, outputPath)
} else if (command === 'build') {
	build(projectPath, contentPath, outputPath)
}
