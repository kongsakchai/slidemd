# SlideMD Syntax Documentation

## 🌱 Properties

| Property | Description |
|----------|-------------|
| `title` | The title of the slide. |
| `paging` | Enables or disables slide paging (true/false). |
| `class` | Custom CSS class for the slide. |
| `style` | Inline CSS styles for the slide. |
| `color` | Text color for the slide. |
| `bgImg` | URL of the bg image. |
| `bgColor` | bg color of the slide. |
| `bgSize` | Size of the bg image (e.g., cover, contain). |
| `bgPosition` | Position of the bg image (e.g., center, top left). |
| `bgRepeat` | How the bg image should repeat (e.g., no-repeat, repeat). |
| `transition` | Type of transition effect (e.g., fade, slide). |
| `in` | Applies the transition effect when the slide is entered. |
| `out` | Applies the transition effect when the slide is exited. |
| `duration` | Duration of the transition effect in milliseconds. |
| `timing` | Timing function for the transition (e.g., ease-in, ease-out). |

### ✨ Usage

These are defined at the top of a slide.

```txt
---
title: Title of the Slide
paging: true
class: custom-class
style: font-size: 16px; color: #333;
color: #ff0000
bgImg: url('path/to/image.jpg')
bgColor: #ffffff
bgSize: cover
bgPosition: center
bgRepeat: no-repeat
transition: fade
duration: 500ms
timing: ease-in-out
---
```

---

## 🚀 Directives

| Directives | Description |
|----------|-------------|
| `paging` | Enables or disables slide paging (true/false/hold/skip). |
| `class` | Custom CSS class for the slide. |
| `style` | Inline CSS styles for the slide. |
| `color` | Text color for the slide. |
| `backgroundImg` | URL of the background image. |
| `backgroundColor` | Background color of the slide. |
| `backgroundSize` | Size of the background image (e.g., cover, contain). |
| `backgroundPosition` | Position of the background image (e.g., center, top left). |
| `backgroundRepeat` | How the background image should repeat (e.g., no-repeat, repeat). |
| `transition` | Type of transition effect (e.g., fade, slide). |
| `in` | Applies the transition effect when the slide is entered. |
| `out` | Applies the transition effect when the slide is exited. |
| `duration` | Duration of the transition effect in milliseconds. |
| `timing` | Timing function for the transition (e.g., ease-in, ease-out). |

### ✨ Usage

```js
<!-- paging: style; class: customClass -->
```

You can also use an underscore prefix for a directive to make it apply only to the current page.

```js
<!-- _paging: style; _class:"customClass1 customClass2" -->
```

---

## 🍎 Image Syntax

```markdown
![image w:500px h:500px cover options... filters...](image.jpg)
```

The first part of the alt text is used to identify the image, and the rest can be used for options and filters.

### Options

| Option | Description |
|--------|-------------|
| `w` | Width of the image (e.g., `w:500px`). |
| `h` | Height of the image (e.g., `h:500px`). |
| `contain` |  Apply `object-fit: contain;` to the image. |
| `cover` |  Apply `object-fit: cover;` to the image. |

### Class

You can add class to the image using an dot prefix.

```markdown
![image .custom-class](image.jpg)
```

### Filters

You can apply filters to images using the `filter_name:value` syntax. if you using only `filter_name` it will apply the default value for that filter.

```markdown
![image w:500px h:500px blur:10px brightness:1.5 opacity](image.jpg)
```

| Filter | Description | default |
|--------|-------------| --------|
| `blur` | Applies a blur effect to the image. | 10px |
| `brightness` | Adjusts the brightness of the image (e.g., `brightness:0.5`). | 1.5 |
| `contrast` | Adjusts the contrast of the image (e.g., `contrast:0.5`). | 2 |
| `grayscale` | Converts the image to grayscale (e.g., `grayscale:0.5`). | 1 |
| `hue-rotate` | Rotates the hue of the image (e.g., `hue-rotate:90deg`). | 180deg |
| `invert` | Inverts the colors of the image (e.g., `invert:0.5`). | 1 |
| `opacity` | Adjusts the opacity of the image (e.g., `opacity:0.5`). | 0.5 |
| `saturate` | Adjusts the saturation of the image (e.g., `saturate:0.5`). | 2 |
| `sepia` | Applies a sepia effect to the image (e.g., `sepia:0.5`). | 1 |

### Background Image

You can also use the image syntax to set a background image for a slide. Use the `bg` option to specify that it should be a background image.

```markdown
![image bg w:100% h:100%](background.jpg)
```

| Option | Description |
|--------|-------------|
| `bg` | Specifies that the image should be used as a background image. |
| `bg-cover` | Applies `background-size: cover;` to the background image. |
| `bg-contain` | Applies `background-size: contain;` to the background image. |
| `bg-repeat:value` | Specifies how the background image should repeat (e.g., `bg-repeat:no-repeat`). |

---

## 🍫 Attributes

You can use comments to add attributes to elements.

### ✨ Usage

```markdown
# Hello World <!-- #title .custom-tile alt="Hello World" -->
```

will be rendered as:

```html
<h1 id="title" class="custom-tile" alt="Hello World">Hello World</h1>
```

### Special Attributes

| Attribute | Description |
|-----------|-------------|
| `transition` | Specifies the transition effect to apply (e.g., `transition:fade`). |
| `in` | Applies the transition effect when the object is entered. |
| `out` | Applies the transition effect when the object is exited. |
| `step` | Specifies the step number for the object (e.g., `step:1`). |

### Step Attributes

You can use the `step` attribute to control the visibility of elements based on the current step.

```markdown
# Slide Title <!-- step:1 -->

## Slide Content <!-- step -->

## Slide Content <!-- step:2 -->
```

will be rendered as:

```html
<section data-steps="3">
    <h1 data-step="1">Slide Title</h1>
    <h2 data-step="3">Slide Content</h2> <!-- this will automatically be step 3 -->
    <h2 data-step="2">Slide Content</h2>
</section>
```
