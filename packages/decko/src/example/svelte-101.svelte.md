---
title: Svelte 101
tags:
    - svelte
    - slide
---

<!--
layout: cover
bgColor: #ffffff;
bgOpacity: 0.2;
bgImg: radial-gradient(#000000 1.1500000000000001px, #ffffff 1.1500000000000001px);
bgSize: 23px 23px;
-->

# Svelte 101

Frameworks without the framework

> By Sakchai Paoin

![first | bg cover](https://user-images.githubusercontent.com/1162160/101544140-30f02980-3973-11eb-8acd-781203261e0c.png)

---

## Svelte คือ

> Ref: <https://svelte.dev/>

![svelte-logo w=300px h=150px cover](https://logo.svgcdn.com/logos/svelte.png)

Svelte คือ UI Frameworks ที่มีจุดประสงค์ในการทำ UI Component ของ Web เพื่ออำนวยความสะดวกในการ reuse component ทั้งส่วน UI / Styling และ Logic ใน Component ได้ เหมือน React, Vue, Angular ที่ถูกสร้างโดย Rich Harris และ maintain โดย Svelte core team

---

## Svelte

- Write less code
- No virtual DOM
- Truly reactive

---

### Write less code

> <https://svelte.dev/blog/write-less-code>

---

<!--
split: 2
split-gap: 10px
-->

:::div

**⚛️ React**

```tsx
import React, { useState } from 'react'

export default () => {
	const [a, setA] = useState(1)
	const [b, setB] = useState(2)

	return (
		<div>
			<input type="number" value={a} onChange={() => setA(a + 1)} />
			<input type="number" value={b} onChange={() => setB(b + 1)} />

			<p>
				{a} + {b} = {a + b}
			</p>
		</div>
	)
}
```

:::

:::div

**🔥 Svelte**

```svelte
<script>
	let a = $state(1)
	let b = $state(2)
</script>

<input type="number" bind:value={a} />
<input type="number" bind:value={b} />

<p>{a} + {b} = {a + b}</p>
```

:::

---

### No virtual DOM

Rich Harris มีแนวคิดว่าเฟรมเวิร์คสำหรับงาน frontend แบบ React มีส่วนที่สิ้นเปลือง (overhead) เยอะเกินไป แต่นอกจากค่าแบนด์วิดท์ส่งข้อมูล ค่า Storage แล้วยังต้องสิ้นเปลืองพลังของเบราว์เซอร์ด้วย

> <https://svelte.dev/blog/virtual-dom-is-pure-overhead>

---

![virtual-dom | bg no-repeat](https://miro.medium.com/v2/resize:fit:1200/1*NLNoFfBWzu8Uu1RgWw3Z9g.jpeg)

---

### Truly reactive

> <https://svelte.dev/blog/frameworks-without-the-framework>

---

![svelte-compile | bg .size-2/3 .items-center](https://miro.medium.com/max/2000/1*_7upPeJparkaxnpBhOkZig.png)

---

ปัจจุบัน React 19 ก็มี Feature React Compiler ตั้งแต่ปี 2024

> <https://react.dev/learn/react-compiler>

---

<!--
split: 2
split-gap: 10px
-->

:::div

**⚛️ React**

![react-build](https://media.discordapp.net/attachments/1340880624507944992/1448894440721743963/image.png?ex=693ceb99&is=693b9a19&hm=5124b3aa520f727779b22a6c485178a638f903f8bd0270715b7a1b04c4ca3350&=&format=webp&quality=lossless&width=1782&height=824)

:::

:::div

**🔥 Svelte**

![svelte-build](https://media.discordapp.net/attachments/1340880624507944992/1448894653146468425/image.png?ex=693cebcc&is=693b9a4c&hm=c34ca179b56c93b1588fafa589530057437e4aca4b62bcce518ed7b772fd8d12&=&format=webp&quality=lossless&width=1699&height=738)

:::

---

## Project Structure

```sh
Project
├── README.md
├── bun.lock
├── index.html
├── package.json
├── public
│   └── vite.svg
├── src
│   ├── App.svelte
│   ├── app.css
│   └── main.ts
├── svelte.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## Svelte Basic

---

### Basic Syntax

```svelte
<script>
	// Logic
</script>

<p>Hello World</p>

<style>
	/* Style */
</style>
```

```svelte step-1 .transition-all
<script lang="ts"> // [!code ++]
// Logic
</script>

<p>Hello World</p>

<style lang="postcss"> // [!code ++]
  @reference "tailwindcss"; // [!code ++]

  p { // [!code ++]
    background: theme(--color-gray-100); // [!code ++]
  } // [!code ++]
</style>
```

---

### Attribute

#### Inline attributes

```svelte
<img src="https://svelte.dev/tutorial/image.gif" />
```

#### Dynamic attributes <!-- step-1 .transition-all -->

```svelte step-1 .transition-all
<script>
	const src = 'https://svelte.dev/tutorial/image.gif'
</script>

<img {src} />
```

#### Shorthand attributes <!-- step-2 .transition-all -->

```svelte step-2 .transition-all
<script>
	const src = 'https://svelte.dev/tutorial/image.gif'
</script>

<img {src} />
```

---

### Component

> my-component.svelte

```svelte
<img src="https://svelte.dev/tutorial/image.gif" />
```

> App.svelte

```svelte
<script lang="ts">
	import MyComponent from './my-component.svelte'
</script>

<MyComponent />
```

![rick](https://svelte.dev/tutorial/image.gif) <!-- step-1 -->

---

### State

```svelte
<script>
	let a = $state(1)
</script>
```

```svelte step-1 .transition-all
<script>
	let a = $state(1)

	function increment() {
		count += 1
	}
</script>

<button onclick={increment}>
	Clicked {count}
</button>
```

---

### V4

```svelte
<script>
	let a = 1
</script>
```

<!-- split -->

### V5

```svelte
<script>
	let a = $state(1) // [!code ++]
</script>
```

---

### Deep State

```svelte
<script lang="ts">
	let list = $state<number[]>([])

	function addNumber() {
		list.push(list.length + 1)
	}
</script>
```

---

<iframe src="https://svelte.dev/tutorial/svelte/deep-state" style="height:600px"/>

---

### Derived State

```svelte
<script lang="ts">
	let list = $state<number[]>([])
	let total = $derived(list.reduce((t, n) => t + n, 0)) // [!code ++]
</script>
```

```svelte step-1 .transition-all
<script lang="ts">
	let list = $state<number[]>([])
	let totalodd = $derived.by(() => {
		// [!code ++]
		const odd = list.filter((n) => n % 2 != 0) // [!code ++]
		return odd.reduce((t, n) => t + n, 0) // [!code ++]
	})
</script>
```

---

### Lifecycle

**⚛️ React**

```tsx
import { useEffect } from 'react'

function App() {
	useEffect(() => {
		// fetch data from backend

		return () => {
			// unmount
		}
	}, [])
}
```

**🔥 Svelte** <!-- step-1 .transition-all -->

```svelte step-1 .transition-all
<script lang="ts">
	import { onMount } from 'svelte'

	onMount(() => {
		// fetch data from backend

		return () => {
			// unmount
		}
	})
</script>
```

---

### Reactive

:::split

**⚛️ React**

```tsx
import { useEffect } from 'react'

function ChatRoom() {
	const [a, setA] = useState(0)

	useEffect(() => {
		// fetch data from backend
		return () => {
			// unmount
		}
	}, [a]) // [!code ++]
}
```

:::

:::split

**🔥 Svelte** <!-- step-1 .transition-all -->

```svelte step-1 .transition-all
<script lang="ts">
	let a = $state(1)

	$effect(() => {
		// [!code ++]
		const b = a // [!code ++]
	})
</script>
```

:::

---

<!--
class: place-content-start
split: 2
-->

❌ Don't

```svelte
<script lang="ts">
	let a = $state(1)
	let b = $state(1)

	$effect(() => {
		b = a * 2
	})
</script>
```

✅ Do <!-- step-1 .transition-all -->

```svelte step-1 .transition-all
<script lang="ts">
	let a = $state(1)
	let b = $derived(a * 2)
</script>
```

---

### Universal reactivity

**⚛️ React**

- useContext
- Zustand
- Redux

**🔥 Svelte** <!-- step-1 .transition-all -->

Create file `store.svelte.ts` or `store.svelte.js` <!-- step-1 .transition-all -->

```ts step-1 .transition-all
export const counter = $state({
	count: 0
})
```

```svelte step-1 .transition-all
<script>
	import { counter } from './store.svelte.ts'
</script>

<button onclick={() => (counter.count += 1)}>
	clicks: {counter.count}
</button>
```

---

### Props

> my-component.svelte

```svelte
<script lang="ts">
	interface Props {
		title: name
	}

	let { title }: Props = $props() // [!code ++]
</script>

<img src="https://svelte.dev/tutorial/image.gif" />
```

> App.svelte

```svelte
<script lang="ts">
	import MyComponent from './my-component.svelte'
</script>

<MyComponent tile="I'm svelte" /> <!-- [!code ++] -->
```

---

### Default Props

> my-component.svelte

```svelte
<script lang="ts">
	interface Props {
		title: name
		callback?: () => void
	}

	let { title = "I'm Svelte" }: Props = $props() // [!code ++]
</script>

<img src="https://svelte.dev/tutorial/image.gif" />
```

> App.svelte

```svelte
<script lang="ts">
	import MyComponent from './my-component.svelte'
</script>

<MyComponent />
```

---

### Logic Block

#### if else block

```svelte
{#if count > 10}
	<p>{count} is greater than 10</p>
{:else if count == 5}
	<p>{count} is middle in 0 and 10</p>
{:else}
	<p>{count} is between 0 and 10</p>
{/if}
```

#### each block

```svelte
<div>
	{#each colors as color, i (color)}
		<button style="background: {color}" onclick={() => (selected = color)}>
			number {i}
		</button>
	{/each}
</div>
```

---

#### await block

```svelte
{#await promise}
	<p>...rolling</p>
{:then number}
	<p>you rolled a {number}!</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```

---

### Binding

```svelte
<script>
	let name = $state('world')
</script>

<input bind:value={name} />

<h1>Hello {name}!</h1>
```

```svelte
 <select
  bind:value={selected}
  onchange={() => /* do any something */}
 >
  {#each questions as question}
   <option value={question}>
    {question.text}
   </option>
  {/each}
 </select>
```

---

### Class

```svelte
<div class={large ? 'large' : 'small'}>...</div>
```

```svelte
<div class={{ large, small: !large }}>...</div>
```

```svelte
<div class:large class:small={!large}>...</div>
```

---

### Style

```svelte
<div style:transform={large ? 'rotateY(0)' : ''}>...</div>
```

---

### Reuse content

**⚛️ React**

```tsx
import { useEffect } from 'react'

function ChatRoom() {
	const Hello = (props) => <h1>Hello {props.name}</h1>

	return <div>{Hello({ name: 'Batman' })}</div>
}
```

---

**🔥 Svelte**

```svelte
{#snippet Hello(name)}
	<h1>Hello {name}</h1>
{/snippet}

{@render Hello('Batman')}
```

---

### Passing Snippet

> my-component.svelte

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		Hello: Snippet<[string]>
	}

	let { Hello }: Props = $props() // [!code ++]
</script>

{@render Hello('Batman')}
```

<!-- split -->

> App.svelte

```svelte
<script lang="ts">
  import MyComponent from "./my-component.svelte"
</script>

{#snippet Hello(name)}
 <h1>Hello {name}</h1>
{/snippet}

<MyComponent {Hello}>

<!-- OR -->

<MyComponent>
  {#snippet Hello(name)}
    <h1>Hello {name}</h1>
  {/snippet}
</MyComponent>
```

---

### Children

```svelte
<MyComponent>
	<h1>Hello Morty</h1>

	{#snippet Hello(name)}
		<h1>Hello {name}</h1>
	{/snippet}
</MyComponent>
```

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children: Snippet
		Hello: Snippet<[string]>
	}

	let { children, Hello }: Props = $props() // [!code ++]
</script>

{@render children()}

{@render Hello('Batman')}
```

---

### Build in animation

<iframe src="https://svelte.dev/tutorial/svelte/transition" style="height:600px"/>

---

![next-logo w=500px](https://brandlogos.net/wp-content/uploads/2022/07/next.js-logo_brandlogos.net_zeccw.png)

<!-- split -->

![svelte-kit-logo  w=500px](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Svelte-kit-horizontal.svg/2560px-Svelte-kit-horizontal.svg.png)

---

<iframe width="560" style="height:600px" src="https://www.youtube.com/embed/E9HxrW5yivs?si=0OyDiK4lR8yfjgm3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
