import { readdirSync } from 'fs'
import path from 'path'

// const readGitignore = (contentPath: string) => {
// 	const absolutePath = path.resolve(contentPath)
// 	const gitignorePath = path.join(absolutePath, '.gitignore')

// 	if (!existsSync(gitignorePath)) {
// 		return []
// 	}

// 	const contents = readFileSync(gitignorePath, 'utf-8')
// 	const list = contents
// 		.split('\n')
// 		.map((line) => line.trim())
// 		.filter((line) => line && !line.startsWith('#'))
// 	const regex =
// }

export const getMarkdownList = (contentPath: string) => {
	const filterMD = (str: string) => {
		return /^[^.].*\.md$/.test(str) && /\/\./.test(str) === false
	}
	const absolutePath = path.resolve(contentPath)
	const markdowns = readdirSync(absolutePath, { recursive: true, encoding: 'utf-8' }).filter(filterMD)

	return markdowns
}
