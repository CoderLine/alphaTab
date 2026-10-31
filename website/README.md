# alphaTab Website and Documentation

![alphaTab](https://raw.githubusercontent.com/CoderLine/alphaTab/develop/img/banner.png)

The source of <https://www.alphatab.net/>, built with <img alt="Docusaurus" src="https://docusaurus.io/img/docusaurus.svg" width="16" /> [Docusaurus](https://docusaurus.io/). It is the `website/` workspace of the alphaTab monorepo.

## Local workflow

Run everything from the repository root. The site builds against the local `@coderline/*` packages, so build them once, and again after changing their source:

```bash
npm install
npm run build-web
npm run build-language-server
npm run build-monaco
npm run build-react
```

Then start the dev server on `http://localhost:3000`:

```bash
npm run dev-website
```

`npm run build-website` runs the production build into `website/build/`, including the broken-link check.

Inside `website/`, `npm run typecheck`, `npm run lint` and `npm test` check the site code.

## Generated reference docs

The API, settings and type reference pages, the reference tables, the alphaTex metadata partials and `src/css/highlight.scss` are generated from alphaTab's JSDoc by `npm run generate-alphatabdoc` and are not committed. `npm run build` and `npm start` run the generator first; `npx docusaurus start` does not and fails with a hint to run it.

To change a generated page, edit the JSDoc in `packages/alphatab/src`, or the hand-written `_<member>.mdx` partial next to the generated page.
