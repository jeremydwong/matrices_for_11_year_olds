# Matrix Explorer — matrices for 11-year-olds

Interactive one-page React site teaching linear algebra to a kid (Espen), chapter by
chapter, with playable widgets. Written in a warm, first-person voice ("Hi Espen").

## Commands

- `npm run dev` — vite dev server
- `npm run build` — production build to `dist/`
- No tests, no linter configured. React 18 + vite, plain JS/JSX (no TS).

## Structure

```
index.html            vite entry; inline style matching theme bg to avoid white flash
main.jsx              mounts <MatrixExplorer/>; imports styles/reference/{normalize,skeleton}.css + styles/site.css
matrix-explorer.jsx   ~4k lines — ALL chapter components + shared widgets + main app/nav
Markdown.jsx          tiny custom markdown renderer for chapter prose (see directives below)
shared-blocks.jsx     Prose, Callout, Definition, TakeHome blocks
theme.js              color/font tokens (dark theme); accentMap for md directives
theme-orig.js         backup of original theme
content/chN-*.md      chapter prose, imported via vite `?raw`
content/backup-original/  old versions
styles/site.css       glue CSS: navbar, toggle, light-mode, matrix sizing (see below)
styles/reference/     verbatim copies of normalize/skeleton/custom.css from jeremydwong.github.io
```

## How chapters work

- `matrix-explorer.jsx` bottom: `chapterData` array = the registry (num, title,
  component, color). Nav renders from it; `jumpTo(num)` allows cross-chapter links.
- Each chapter component `ChN()` renders `<Markdown src={CONTENT[n].intro}/>`,
  its interactive widgets, then `middle`/`outro` sections.
- `CONTENT[n]` comes from splitting `content/chN-*.md` on top-level `# intro`,
  `# middle`, `# outro` headings (see `splitMd`). Adding a chapter = new md file,
  new import, new `CONTENT` entry, new component, new `chapterData` row.

## Markdown dialect (Markdown.jsx)

Paragraphs, `**bold**`, `*italic*`, `` `code` ``, links, ordered/unordered lists,
`#`–`######` headings, `{{math-ish}}` gold mono spans, plus directives:

```
:::definition ... :::playful ... :::end
:::callout color=gold ... :::end
:::takehome color=cyan  :::major - item  :::minor - item  :::end
```

Colors must be keys of `accentMap` in theme.js.

## Styling conventions

- Widgets use inline styles with tokens from `theme.js` (`COLORS`, `fonts`). Site
  chrome (navbar, toggle, light mode) lives in `styles/site.css`.
- Light mode = CSS `filter: invert(1) hue-rotate(180deg)` on `.app-body` only
  (navbar/toggle stay unfiltered). Don't put fixed/sticky elements inside `.app-body`.
- Matrix rendering: use the `.matrix` / `.mx-grid` / `.mx-bracket` / `.mx-cell` /
  `.mx-sign` classes in site.css — one `--mx-cell` variable drives cell size, digit
  font (auto-shrinks via `data-len`), bracket arms, and operator signs. Don't
  hand-roll matrix cell sizing in JSX.

## Content voice

Addressed to an 11-year-old: concrete, playful, zero condescension. Formal
definitions always paired with a "plain English" restatement (`:::definition`).
Chapters end with a `:::takehome` (major/minor bullets).
