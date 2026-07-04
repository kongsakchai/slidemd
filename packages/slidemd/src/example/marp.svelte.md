---
title: My Custom Marp
theme: main
paginate: true
tags:
    - marp
    - slide
---

<!--
split: 2
layout: no-padding
-->

:::div

hello `code` asdas ~~asdas~~

```js /App/
import { mount } from 'svelte'

import App from './App.svelte'
import './app.css'

const app = mount(App, {
	target: document.getElementById('app')!
})

export default app
```
