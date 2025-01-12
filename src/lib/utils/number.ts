export const hashToNumber = (hash?: string) => {
	const str = hash || '#1';
	return strToNumber(str.slice(1));
};

export const strToNumber = (str: string) => {
	try {
		const number = parseInt(str);
		return isNaN(number) ? 0 : number;
	} catch {
		return 0;
	}
};

export const clamp = (value: number, min: number, max: number) => {
	return Math.min(Math.max(value, min), max);
};
