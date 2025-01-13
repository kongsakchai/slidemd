export const byClass = <T extends HTMLElement = HTMLElement>(
	selector: string,
	parent: Document | HTMLElement = document
) => parent.getElementsByClassName(selector) as HTMLCollectionOf<T>;

export const onAll = <Event extends keyof HTMLElementEventMap>(
	element: HTMLCollectionOf<HTMLElement>,
	event: Event,
	callback: (this: HTMLElement, ev: HTMLElementEventMap[Event]) => unknown
) => {
	[...element].forEach((el) => {
		el.addEventListener(event, callback);
	});
};

export const removeAll = <Event extends keyof HTMLElementEventMap>(
	element: HTMLCollectionOf<HTMLElement>,
	event: Event,
	callback: (this: HTMLElement, ev: HTMLElementEventMap[Event]) => unknown
) => {
	[...element].forEach((el) => {
		el.removeEventListener(event, callback);
	});
};
