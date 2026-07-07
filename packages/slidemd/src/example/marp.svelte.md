---
title: My Custom Marp
theme: main
paginate: true
tags:
    - marp
    - slide
---

<script>
let s = $state(0)
</script>

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

```mermaid .h-[300px]
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
:::

---
```
