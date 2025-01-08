const copy = (e: Event) => {
	if (!e.target) return;

	const btn = e.target as HTMLButtonElement;
	const code = btn.parentElement?.querySelector('pre');
	if (!code || !code.textContent) return;

	navigator.clipboard.writeText(code.textContent);
	btn.textContent = 'Copied!';
	setTimeout(() => {
		btn.textContent = 'Copy';
	}, 2000);
};

export const initCodeCopyButton = () => {
	const btn = document.querySelectorAll('button.copy-code');
	btn.forEach((btn) => {
		btn.addEventListener('click', copy);
	});

	return () => {
		btn.forEach((btn) => {
			btn.removeEventListener('click', copy);
		});
	};
};
