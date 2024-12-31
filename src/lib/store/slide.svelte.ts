export class SlideStore {
	page = $state(1);
	pageCount = $state(1);
	ready = $state(false);

	toString = () => `${this.page} of ${this.pageCount}`;

	setPageCount = (count: number) => {
		this.pageCount = count;
		this.page = 1;
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
