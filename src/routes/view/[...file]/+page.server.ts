export const trailingSlash = 'always'

// const markdownList = process.env.SLIDEMD_LIST?.split(',') || []

export const load = ({ params }) => {
	let file = params.file
	if (file.endsWith('/')) {
		file = file.slice(0, -1)
	}
	return { file }
}
