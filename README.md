# Applications for Vectors and Matrices — Editing Guide

This is a React app where the **interactive widgets** live in `matrix-explorer.jsx` and the **prose text** lives in plain Markdown files under `content/`. You can rewrite, expand, or reorganize any chapter's text without touching React.

## File layout

```
matrix-explorer.jsx       ← main React component (sliders, graphs, animations)
Markdown.jsx              ← lightweight parser that renders the .md files
shared-blocks.jsx         ← styled boxes (Prose, Callout, Definition, TakeHome)
content/
  ch0-intro.md            ← Introduction
  ch1-linear-systems.md   ← Linear Systems (Ax = b)
  ch2-transformations.md  ← Transformations
  ch3-vector-shadows.md   ← Vector Shadows: the Dot Product
  ch4-rotations.md        ← Rotations
  ch5-determinants.md     ← Determinants
  ch6-homogeneous.md      ← Homogeneous Coordinates
  ch7-markov-chains.md    ← Markov Chains
  ch8-neural-networks.md  ← Neural Networks
  ch9-summary.md          ← Summary
```

## How each chapter file is structured

Most chapters have an `intro` section (text before the interactive widget) and an `outro` section (text after — usually closing remarks plus the take-home box):

```markdown
# intro

Plain markdown here. **Bold**, *italic*, `code`, [links](https://example.com).
Lists work too:

- like this
- and this

# outro

Closing prose, plus directives for special blocks (see below).
```

The `# intro` and `# outro` markers are how the React component splits the file into the right slots. **Don't remove them.** If a chapter has no `# outro` section (e.g. Ch0), just write everything under `# intro`.

## Custom directives

Markdown alone can't express the styled boxes the design uses. Three custom directives fill the gap. All three open with `:::name` and close with `:::end`.

### Definition box

A formal italic statement followed by a plain-English version:

```markdown
:::definition
The **dot product** of two vectors a = (a₁, a₂) and b = (b₁, b₂) is defined as
the single number a · b = a₁b₁ + a₂b₂.
:::playful
Multiply matching parts, add them up. That's it. It eats two vectors and
spits out one number.
:::end
```

### Callout (italic side-quote with a colored bar)

```markdown
:::callout color=orange
Try setting θ to π/2 and watch what happens.
:::end
```

Colors available: `cyan`, `magenta`, `gold`, `green`, `orange`, `purple`, `muted`.

### Take-Home (the gold ✦ box at the end of a chapter)

```markdown
:::takehome color=gold
:::major
- The biggest idea from this chapter.
- The second biggest idea.
- The third.
:::minor
- A supporting note.
- Another fine detail.
:::end
```

`:::major` items are bigger and bullet-prefixed. `:::minor` items are smaller and muted. Either list can be empty (just leave it out).

## Inline formatting reference

Inside any block:

| What you write | What you get |
| --- | --- |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `` `code` `` | monospace, gold-ish |
| `{{x̂}}` | "math span" — monospace gold (use for things like `{{cos θ}}` or `{{x̂}}`) |
| `[click me](https://...)` | a link (opens in new tab if URL starts with `http`) |

Lists are written with `-` or `1.`. Paragraphs are blank-line-separated. Standard Markdown.

## What you **cannot** edit from a `.md` file

The interactive widgets — sliders, graphs, the live SVGs, the 3D viewer, the trainable neural network — all live in `matrix-explorer.jsx`. Some chapters also have inline live readouts (e.g. Ch1's solution box that shows `x = 0.50, y = 0.20`) which need React state and stay in the JSX.

If you want to change a widget's behavior or appearance, you'll need to edit the JSX. If you want to change the words around the widget, the Markdown file is enough.

## Loading the Markdown files

The main file imports each chapter with `?raw`:

```js
import ch1Md from "./content/ch1-linear-systems.md?raw";
```

This works out of the box in **Vite** and **Next.js**. For **Create React App**, you may need to add a tiny webpack rule, or just rename the files to `.md.js` exporting the string. (If you're using anything else and `?raw` doesn't resolve, ping me.)

## Quick edit checklist

To rewrite the intro of a chapter:

1. Open `content/chN-name.md`.
2. Edit text under `# intro`.
3. Save. Hot-reload picks it up.

To change a take-home:

1. Open the chapter's `.md` file.
2. Find the `:::takehome` block at the bottom.
3. Edit the `:::major` and `:::minor` bullets.
4. Save.

To add a callout to a chapter intro:

1. In `content/chN-name.md`, under `# intro`, add:
   ```
   :::callout color=cyan
   Your callout text here.
   :::end
   ```
2. Save.

That's it.
