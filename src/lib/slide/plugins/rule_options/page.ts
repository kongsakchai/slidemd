import type { PageOptionRule } from '../../types';

export const pageRule: PageOptionRule = (val, state) => {
	switch (state.env.paging) {
		case 'skip':
			return val;
		case 'hold':
			return val;
		default:
			return (val ?? 0) + 1;
	}
};
