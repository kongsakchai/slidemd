import type { PageOptionRule } from '$lib/slide/types';
import { resolveAssetUrl } from '../helper';

export const backgroundImageRule: PageOptionRule = (val: string, state) => {
	const url = /url\("(.+)"\)/.exec(val);
	if (url) {
		const newUrl = resolveAssetUrl(url[1], state.env.base);
		val = val.replaceAll(url[1], newUrl);
	}
};
