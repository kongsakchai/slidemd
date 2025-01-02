export class SlideStore {
	page = $state(1);
	pageCount = $state(1);
	ready = $state(false);

	toString = () => `${this.page} of ${this.pageCount}`;

	initPage = (page: number, count: number) => {
		this.page = page;
		this.pageCount = count;
	};

	next = () => {
		if (this.page < this.pageCount) this.page++;
	};

	prev = () => {
		if (this.page > 1) this.page--;
	};

	setReady = (value: boolean) => {
		this.ready = value;
	};
}

export const slideStore = new SlideStore();
