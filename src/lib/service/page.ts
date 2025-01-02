import { page } from '$app/state';

export const currentPage = () => {
	const hash = page.url.hash;
	if (!hash) return 1;

	try {
		const pageNumber = parseInt(hash.slice(1));
		return isNaN(pageNumber) ? 1 : pageNumber;
	} catch {
		return 1;
	}
};
