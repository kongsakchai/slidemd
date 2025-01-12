export interface Contents {
	file: string;
	metadata: {
		[key: string]: string;
	};
	body: string;
}

export interface DirectoryItem {
	name: string;
	type: 'file' | 'dir';
	path: string;
}
