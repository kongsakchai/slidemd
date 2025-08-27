export interface Folder {
	folders: Record<string, Folder>
	files: File[]
	path: string
}

export interface File {
	name: string
	path: string
}
