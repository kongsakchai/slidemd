---
title: Hello, SlideMd
---

# Hello, SlideMd { .text-red-500 }

Make Presentation by Markdown

---

# Header 1

## Header 2

### Header 3

#### Header 4

##### Header 5

###### Header 6

---

## Paragraphs

I really like using Markdown.I think I'll use it to format all of my documents from now on.
I just love **bold text**.

Italicized text is the *cat's meow*.
This text is ***really important***.

---

## Blockquotes

To create a blockquote, add a > in front of a paragraph.

> Dorothy followed her through many of the beautiful rooms in her castle.

---

## List

1. First item
2. Second item
3. Third item
4. Fourth item
    - Test 1
    - Test 2
    - Test 3

- First item
- Second item
- Third item

* First item
* Second item
* Third item
* Fourth item

---

## Code Block

Inline `Code`

```svelte
<script>
 function greet() {
  alert('Welcome to Svelte!');
 }
</script>

<button onclick={greet}>click me</button>

<style>
 button {
  font-size: 2em;
 }
</style>
```

---

<!-- _class: dark -->

## Code Block Dark

Inline `Code`

```svelte
<script>
 function greet() {
  alert('Welcome to Svelte!');
 }
</script>

<button onclick={greet}>click me</button>

<style>
 button {
  font-size: 2em;
 }
</style>
```

---

## Link

My favorite search engine is [Duck Duck Go](https://duckduckgo.com).
<https://www.markdownguide.org>
<fake@example.com>

---

## Image

![image w:300](../image/1%20เดือนแรกของผมที่%20Arise%20by%20INFINITAS-1724925027869.jpeg)

---

## Table

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

---

## Strikethrough

~~The world is flat.~~ We now know that the world is round.

## Task list

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

---

<iframe src="https://svelte.dev/" ></iframe>

---

## Alert

### Classic

> Normal
> Test Normal Alert

### Note

> [!Note]
> Note alert

### Important

> [!Important]
> Important alert

### Tip

> [!Tip]
> Tip alert

---

### Warning

> [!Warning]
> Waning alert

### Caution

> [!Caution]
> caution alert

### Info

>[!Info]
> Info alert

---

### Example

>[!Example]
> Example alert

### Bug

>[!Bug]
> Bug alert

---

```mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
```
