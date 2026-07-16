---
title: Documentation style guide
description: The voice, structure, and code-sample rules every alphaTab doc page follows.
unlisted: true
---

This is the reference every documentation page on this site follows. It applies to the introduction, all getting-started pages, guides, and tutorials. Reference pages under `reference/` are generated and exempt.

## Voice

Second person, present tense. Address the reader as *you*. Use imperatives for steps: *Install the package, import the module, call `render()`*. Keep sentences short — twelve to twenty words is the sweet spot. If a sentence runs longer, split it.

Cut hedging. Delete *just*, *simply*, *please*, *easily*, *basically*. Do not write *we recommend* — either recommend it or don't. Do not write *feel free to* — the reader already knows they are free.

alphaTab is an SDK. Use verbs that reflect ownership: *generate, instantiate, import, embed, wire up, integrate, render, load*. Avoid widget verbs: *drop in, plug in, add*. The reader is building something with alphaTab, not attaching it.

## Write like a human, not like AI

The AI tells that keep showing up in draft copy — remove them all:

- Empty transition sentences: *Let's dive into…, It's important to note that…, Now that we've covered…*
- Triads of adjectives that pad instead of describe: *fast, flexible, and reliable*, *modern, powerful, and intuitive*
- Pep-talk closers: *Happy coding!, You're all set!*
- Vague opener framings: *In today's fast-paced world…, More than ever before…*
- Prose that recaps content the reader already saw two paragraphs earlier

If a sentence tells the reader nothing they did not already know from the surrounding code or headings, delete it.

## Formatting

Bold is for genuine emphasis on a single term or a warning. It is not decoration. If a paragraph has three bolded phrases, remove all three and re-read — the paragraph usually stands without them.

The same applies to `code` spans. Use them for identifiers, filenames, and literal syntax. Do not wrap ordinary nouns in backticks to make them look technical.

No filler headings. Every H2 and H3 introduces content the reader needs. Do not add an *Overview* that repeats the opening paragraph. Do not add a *Conclusion* that summarises what came above.

## Page shape

Every operational page opens with:

1. One sentence explaining what the page covers.
2. A copy-paste install or setup block.
3. A minimal runnable example.

Elaboration and edge cases come after those three. Concept content ("what alphaTab is") stays on the introduction page, not mixed into installation.

Multi-platform documentation uses parallel pages, not tabs. Web, .NET, and Android each get their own installation and configuration pages. Tabs are reserved for package managers (npm / pnpm / yarn) and other truly interchangeable choices.

## Code samples

Every code sample must be paste-runnable. Include the imports at the top. Do not use `...` placeholders to hide setup. Do not write prose steps like *"first, create the API object as shown earlier"* — show the whole snippet again.

```js
// Good — runnable as-is
import * as alphaTab from '@coderline/alphatab';

const element = document.getElementById('alphaTab');
const api = new alphaTab.AlphaTabApi(element, { tex: true });
```

```js
// Bad — reader has to reconstruct the imports and the element
const api = new alphaTab.AlphaTabApi(element, {
    // ...settings
});
```

## Canonical spellings

- `alphaTab` — lowercase *a*, capital *T*, always. Never *AlphaTab* in prose (only in class names like `AlphaTabApi`).
- `.NET` — not `.net`. Applies everywhere except inside package IDs that use lowercase.
- `music sheets` — two words.
- `SoundFont` — one word, capital *F*.
- `Web Worker` and `Audio Worklet` — two words each, both capitalised.
- `alphaTex` — one word, lowercase *a*, capital *T*.

## Cross-links

Link to canonical anchors with stable slugs. When the auto-generated slug is fragile, set it explicitly:

```md
## Configure the plugin {#configure-plugin}
```

Prefer relative links inside `docs/`: `[Configuration](configuration-web)` over the full URL. This keeps preview builds and local dev links working.

## Frontmatter

Every page has `title`, `description`, and `keywords` in the frontmatter. The `description` doubles as the summary line in `llms.txt`, so keep it to one factual sentence — no marketing, no adjectives.

```yaml
---
title: Installation (Web)
description: Install alphaTab in a web project via npm, a CDN, or a local copy, then render your first score.
keywords: alphaTab, install, npm, CDN, web, browser, JavaScript
---
```
