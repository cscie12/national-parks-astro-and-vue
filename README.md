# NPS Explorer: Astro + Vue islands (CSCI E-12)

A static Astro site listing National Park Service sites, with **Vue components
added as interactive "islands"**. Most of the page is plain HTML generated at
build time. Only the parts that need to be interactive ship JavaScript.

| Page | What it shows |
|---|---|
| `/` | A **Parks near me** Vue island (`client:load`) plus a full list of parks rendered by Astro with zero JS |
| `/islands` | The same `Counter.vue` component used five ways, to compare Astro's `client:*` directives |

## Run it

Requires Node 22.23+ (Astro 7).

```bash
npm install
cp .env.example .env      # then put your NPS API key in .env (DEMO_KEY works, but is rate-limited)
npm run dev               # http://localhost:4321
```

Build and preview the production site:

```bash
npm run build             # fetches NPS data ONCE and writes static HTML to dist/
npm run preview           # serves dist/ at http://localhost:4321
```

After building, open `dist/index.html` in an editor: the full park list is
already in the HTML. The NPS API is not called again when people visit the
site. The data was captured at build time.

## Project layout

```
src/
├── pages/                 ← every file here becomes a route
│   ├── index.astro        /         fetch parks at build time → Vue island + static list
│   └── islands.astro      /islands  client:* directives side by side
├── layouts/
│   └── Layout.astro       shared <html>, header, footer; imports global.css
├── components/            ← Vue single-file components (the islands)
│   ├── ParksNearMe.vue    geolocation + "closest parks" list (receives parks as a prop)
│   └── Counter.vue        tiny button that shows whether it has been hydrated
├── lib/
│   ├── nps.js             server-only: reads the API key, fetches + caches park data
│   └── geo.js             browser geolocation as a Promise + distance math
└── styles/
    └── global.css         colors as CSS variables, light/dark mode
```

## Suggested reading order

1. **`src/pages/index.astro`**: the code between the `---` fences runs at build
   time. It fetches the parks, then passes a *slimmed-down* list to the Vue
   component as a prop.
2. **`src/components/ParksNearMe.vue`**: an ordinary Vue component
   (`ref`, `computed`, `v-for`, `v-model`). It doesn't know it's inside Astro.
3. **`src/lib/nps.js`**: where the secret API key is used, and why that's safe.
4. **`src/pages/islands.astro`** with **`Counter.vue`**: run the dev server and
   follow the instructions on the page.

## Key ideas

### Islands and `client:*` directives

By default, Astro renders a Vue component to HTML on the server and sends
**no JavaScript** for it, so the component looks right but doesn't respond to clicks.
A directive opts the component in to running in the browser ("hydration") and
controls *when* that happens:

| Directive | Rendered at build? | JavaScript loads… |
|---|---|---|
| *(none)* | yes | never: static HTML only |
| `client:load` | yes | right away |
| `client:idle` | yes | when the browser is idle |
| `client:visible` | yes | when it scrolls into view |
| `client:only="vue"` | **no** | right away; it exists only in the browser |

On `/islands`, open DevTools → **Network** (filter: JS) and watch when each
counter's JavaScript arrives. Then compare with **View Source**.

### Why the API key stays private

If a Vue app running in the browser called the NPS API itself, the key would
have to be shipped to every visitor, where anyone could find it in DevTools.
Here, `nps.js` runs only during the build. Astro calls the API, then hands the Vue component the **data** (never
the key) as a prop.

That's also why `.env` uses `NPS_API_KEY` with **no** `PUBLIC_` prefix. Astro
only exposes `PUBLIC_` variables to browser code.

### Props are serialized into the page

Anything passed as a prop to a hydrated island is written into the HTML so the
browser can rebuild the component. That's why `index.astro` maps each park down
to the six fields `ParksNearMe` actually uses instead of sending the full NPS
records.

### Components that receive data instead of fetching it

`ParksNearMe.vue` doesn't fetch parks itself. It's *handed* a list through
its `parks` prop. That keeps it simple and reusable: the component doesn't care
whether the list came from a build step, a browser `fetch`, or a hard-coded
array, so you could drop it into any Vue app unchanged.

## How Vue was added to Astro

```bash
npx astro add vue
```

That installs `@astrojs/vue` and `vue` and adds `vue()` to the `integrations` list in
`astro.config.mjs`. After that, `.vue` files can be imported in any `.astro` file.

## Try it

- Remove `client:load` from `<ParksNearMe>` in `index.astro`. The buttons still
  appear. Why don't they do anything?
- Change it to `client:only="vue"` and use **View Source**. What's missing?
- Add another field (e.g. `designation`) to `parkList` in `index.astro`, then
  show it in `ParksNearMe.vue`.
- Stop the dev server, run `npm run build`, and search `dist/` for your API key.
  (It shouldn't be there.)
