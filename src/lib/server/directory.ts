import type { DirectoryItem } from '$lib/types';
import { readdirSync, realpathSync, statSync, type Dirent } from 'fs';
import { join, normalize } from 'path';

const direntType = (dirent: Dirent) => {
	if (dirent.isDirectory()) {
		return 'dir';
	}
	if (dirent.isFile()) {
		return 'file';
	}
	const realPath = realpathSync(join(dirent.parentPath, dirent.name));
	const state = statSync(realPath);
	if (state.isFile()) {
		return 'file';
	}
	return 'dir';
};

const filterDirent = (dirent: Dirent, type: 'dir' | 'file') => {
	if (type === 'file' && !dirent.name.endsWith('.md')) {
		return false;
	}

	return !dirent.name.startsWith('.');
};

const sortDirectoryItem = (a: DirectoryItem, b: DirectoryItem) => {
	if (a.type === b.type) {
		return a.name.localeCompare(b.name);
	}
	if (a.type === 'dir') {
		return -1;
	}
	return 1;
};

export const loadDirectory = (path: string) => {
	const normPath = normalize(join('contents', path));
	if (!normPath.startsWith('contents')) {
		return [];
	}

	const dirent = readdirSync(normPath, { withFileTypes: true });
	const items: DirectoryItem[] = [];
	for (const d of dirent) {
		const type = direntType(d);
		if (!filterDirent(d, type)) {
			continue;
		}

		const url = type == 'dir' ? join('/', path, d.name) : join('/slide', path, d.name);
		items.push({
			name: d.name,
			type: direntType(d),
			path: url
		});
	}

	return items.sort(sortDirectoryItem);
};
