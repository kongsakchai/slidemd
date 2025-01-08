export const hashToNumber = (hash: string) => {
	try {
		const str = hash || '#1';
		const number = parseInt(str.slice(1));
		return isNaN(number) ? 1 : number;
	} catch {
		return 1;
	}
};

export const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};
