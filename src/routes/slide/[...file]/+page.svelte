<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pageState } from '$app/state';
	import Controller from '$lib/components/Controller.svelte';
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte';
	import { allByClass, onAll, removeAll } from '$lib/utils/element.js';
	import { hashToNumber, strToNumber } from '$lib/utils/number.js';
	import mermaid from 'mermaid';
	import { onMount } from 'svelte';

	let { data } = $props();

	let siglePage = $state(false);
	let page = $state(hashToNumber(pageState.url.hash));
	let step = $state(strToNumber(pageState.url.searchParams.get('step') || '0'));

	let pageFragments: Record<string, HTMLElement[]> = {};

	const navigate = (page: number, step: number) => {
		const url = step > 0 ? `?step=${step}#${page}` : `?#${page}`;
		goto(url, { replaceState: true, noScroll: false });
	};

	const next = () => {
		if (step < pageFragments[page]?.length || 0) {
			step += 1;
		} else if (page < data.total) {
			page += 1;
			step = 0;
		}

		navigate(page, step);
	};

	const prev = () => {
		if (step > 0) {
			step -= 1;
		} else if (page > 1) {
			page -= 1;
			step = pageFragments[page]?.length || 0;
		}

		navigate(page, step);
	};

	const setupFragment = () => {
		const pages = allByClass('slide');
		[...pages].forEach((el, i) => {
			const fragments = allByClass('fragment', el);
			if (fragments.length > 0) {
				pageFragments[el.id] = [...fragments];
			}
		});
	};

	const setupMermaid = () => {
		mermaid.initialize({
			startOnLoad: false,
			fontSize: 12,
			fontFamily: 'Geist Mono, Sarabun'
		});

		mermaid.run({ querySelector: '.mermaid' }).then(() => {
			siglePage = true;
		});
	};

	onMount(() => {
		setupFragment();
		setupMermaid();

		const copyCodeToClipboard = (event: Event) => {
			const button = event.target as HTMLButtonElement | null;
			if (!button) return;

			const codeBlock = button.closest('div')?.querySelector('pre');
			if (!codeBlock?.textContent) return;

			navigator.clipboard.writeText(codeBlock.textContent).then(() => {
				button.textContent = 'Copied!';
				setTimeout(() => {
					button.textContent = 'Copy';
				}, 2000);
			});
		};

		const btns = allByClass('copy-code');
		onAll(btns, 'click', copyCodeToClipboard);

		return () => {
			removeAll(btns, 'click', copyCodeToClipboard);
		};
	});

	$effect(() => {
		pageFragments[page]?.forEach((el, i) => {
			const active = i < step || !siglePage ? 'true' : 'false';
			el.setAttribute('data-fragment-active', active);
		});
	});
</script>

<svelte:head>
	<title>{data.metadata.title}</title>
</svelte:head>

<main class="relative">
	<ThemeSwitch />
	<svg viewBox="0 0 1280 720">
		<foreignObject width="1280" height="720">
			{#each data.slide as pageData, i}
				<section id={(i + 1).toString()} class="slide" class:hidden={siglePage && i + 1 != page}>
					{@html pageData}
				</section>
			{/each}
		</foreignObject>
	</svg>
</main>

<Controller current={page} total={data.total} onnext={next} onprev={prev} />
