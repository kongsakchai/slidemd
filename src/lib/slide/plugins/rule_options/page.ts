import type { PageOptionRule } from '../../types';

export const pageRule: PageOptionRule = (env) => {
	switch (env.paging) {
		case 'skip':
			return env.page;
		case 'hold':
			return env.page;
		default:
			return env.page + 1;
	}
};
