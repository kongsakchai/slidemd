import type { DirectoryItem } from '$lib/types/file';
import fs from 'fs';
import path from 'path';

const prefixPath = 'assets';

export const validatePath = (pathStr: string) => {
	if (!pathStr) return '';
	if (isUrlLink(pathStr) || !isAssetsPath(pathStr)) return null;
	return pathStr;
};

export const isUrlLink = (pathStr: string) => {
	try {
		new URL(pathStr);
		return true;
	} catch {
		return false;
	}
};

export const isAssetsPath = (pathStr: string) => {
	const norm = path.normalize(path.join(prefixPath, pathStr));
	return norm.startsWith(prefixPath);
};

export const getFile = (pathStr: string): string => {
	const assetsPath = path.join(prefixPath, pathStr);
	return fs.readFileSync(assetsPath, 'utf-8');
};

export const getDirectoryItem = (pathStr: string): DirectoryItem[] => {
	try {
		const assetsPath = path.join(prefixPath, pathStr);
		const dirents = fs.readdirSync(assetsPath, { withFileTypes: true });
		const markdownAndDirectory = dirents.filter(isMarkdownOrDirectory);

		return direntsToDirectoryItems(pathStr, markdownAndDirectory);
	} catch {
		return [];
	}
};

const isMarkdownOrDirectory = (dirent: fs.Dirent) => {
	if (isHidden(dirent.name) || (dirent.isFile() && !isMarkdown(dirent.name))) {
		return false;
	}

	return true;
};

export const isHidden = (pathStr: string): boolean => {
	return pathStr.startsWith('.');
};

export const direntsToDirectoryItems = (curentPath: string, dirent: fs.Dirent[]): DirectoryItem[] => {
	const pathDetails = dirent.map((d) => {
		const name = d.name;
		const relativePath = path.join(curentPath, name);
		const type = getDirentType(d);
		return { name, path: relativePath, type };
	});

	pathDetails.sort((a, b) => {
		if (a.type === b.type) return a.name.localeCompare(b.name);
		if (a.type === 'dir') return -1;
		return 1;
	});

	return pathDetails;
};

export const getDirentType = (dirent: fs.Dirent): 'file' | 'dir' => {
	if (dirent.isFile()) return 'file';
	if (dirent.isDirectory()) return 'dir';

	const realPath = fs.realpathSync(path.join(dirent.parentPath, dirent.name));
	const state = fs.statSync(realPath);
	if (state.isFile()) return 'file';
	return 'dir';
};

export const isMarkdown = (pathStr: string): boolean => {
	return path.extname(pathStr) === '.md';
};
