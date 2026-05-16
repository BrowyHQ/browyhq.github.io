# Browy docs

Public documentation for [Browy](https://github.com/BrowyHQ/browy) — an AI agent that lives in your browser.

Live site: <https://browyhq.github.io/>

## Local dev

```sh
npm install
npm run dev
```

## Deploying

Pushes to `main` trigger the `Deploy docs to GitHub Pages` workflow,
which builds the Astro Starlight site and publishes it to GitHub Pages.

## Contributing

Pages live in `src/content/docs/` as plain Markdown / MDX. Sidebar and
site config are in `astro.config.mjs`.

## License

Documentation is published under
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
