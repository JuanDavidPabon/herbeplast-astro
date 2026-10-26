# Herbeplast Astro

Astro migration of the production website in `E:\WebSites\Herbeplast`.

## Local development

```powershell
npm install
npm run dev
```

## Build and preview

```powershell
npm run build
npm run preview
```

The project builds a static site in `dist/`. The Astro build format is set to
`file` so migrated pages can keep their existing `.html` URLs.

## Migration approach

- Keep the production checkout unchanged while the Astro version is developed.
- Migrate one page at a time into `src/pages/` and shared sections into Astro
  components under `src/components/`.
- Keep migrated styles in `src/styles/` and interactive browser behavior in
  imported modules under `src/scripts/`.
- Keep pages that have not yet migrated in `public/` as temporary static pages,
  with their existing CSS and JavaScript, preserving working links during the
  transition.
- Remove each temporary page from `public/` when its Astro page is ready.
