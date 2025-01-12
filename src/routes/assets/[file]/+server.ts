import { read } from '$app/server';
import { error } from '@sveltejs/kit';
import { join, normalize } from 'path';

const assetsQiery = import.meta.glob<string>(['/contents/**/*', '!/contents/**/*.md'], {
	query: '?url',
	eager: true,
	import: 'default'
});

const assets = Object.values(assetsQiery);

export function GET({ params }) {
	if (!params.file) {
		error(400, 'Invalid file path');
	}

	try {
		const norm = normalize(join('/contents/', atob(params.file)));
		const file = assets.find((f) => f == norm);
		if (!file) {
			error(404, 'File not found');
		}
		return read(file);
	} catch {
		error(404, 'File not found');
	}
}
