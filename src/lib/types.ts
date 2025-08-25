export interface Folder {
	folders: Record<string, Folder>
	files: File[]
}

export interface File {
	name: string
	path: string
}
