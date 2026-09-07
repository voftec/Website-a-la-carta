# Website à la carte — Mr. Worldwide Fan Experience

Interactive proposal tool for a modular, WebAR-first artist fan-experience site.
The client picks modules; the landing preview and price update live.

- **Left** — module catalog (10 categories, 60+ modules) with quantities, tiers and dependencies.
- **Center** — full-length landing preview (desktop / mobile) that grows and shrinks with the selection. Click a section to jump to its module.
- **Right** — price calculator: one-time build, monthly run cost, first-year total, discount, payment plan, timeline.

Zero dependencies — plain HTML/CSS/JS. Open `index.html` or serve the folder:

```
npx serve .
```

## Sharing a configuration

The selection is encoded in the URL hash. **Share** copies the link; **Export proposal** opens the print dialog (right panel only) to save a PDF.

## Editing modules and prices

Everything lives in `js/modules.js`:

```js
{ id, cat, name, tagline, desc, oneTime, monthly, weeks,
  qty:   { label, min, max, unit, unitMonthly, default },   // per-unit pricing (e.g. number of AR filters)
  tier:  { label, options: [{ id, name, oneTime, monthly }] }, // variants (e.g. 3D avatar vs volumetric)
  requires: ["ar_hub"],                                       // auto-enables dependencies
  locked: true,                                               // always included (hero, hosting)
  preview: "ar_hub" }                                          // section renderer in js/preview.js
```

Presets (Starter / Fan Experience / Mr. Worldwide) are at the bottom of the same file.

## Deploy

Static — works on GitHub Pages, Vercel or Netlify with no build step.
