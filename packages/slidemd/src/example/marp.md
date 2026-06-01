---
title: My Custom Marp
theme: main
paginate: true
tags:
    - marp
    - slide
---

<!-- split-cols: 2 -->

<div>

## Ref

```js
import { ref } from 'vue'

let foo = 0
let bar = ref(0)

foo = 1
bar = 1 // ts-error
```

</div>

<div>

## Reactive

```js
import { reactive } from 'vue'

const foo = { prop: 0 }
const bar = reactive({ prop: 0 })

foo.prop = 1
bar.prop = 1
```

</div>
