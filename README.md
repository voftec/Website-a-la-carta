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
  requires: ["fanclub"],                                       // auto-enables dependencies
  locked: true,                                               // always included (hero, hosting)
  preview: "ar_hub" }                                          // section renderer in js/preview.js
```

Presets (Starter ≈ $5k / Fan Experience ≈ $8k / Mr. Worldwide ≈ $15k) and the budget bands (`BUDGETS`: Base $5k, Mid $8k, Top $15k) are at the bottom of the same file. The calculator shows which band the current selection falls in.

## Deploy

Static — works on GitHub Pages, Vercel or Netlify with no build step.

## Personalizar el artista

Agrega el nombre al link y el titulo/hero cambian: `?artist=daddy-yankee` (o corto: `?jlo`). Separa palabras con `-`. Sin parametro muestra Pitbull / Mr. Worldwide.


## Editar precios en Excel

`catalog.csv` tiene una fila por modulo (categoria, nombre, descripcion, precio unico, mensual, semanas, dependencias) y filas `quantity` / `tier` para precios por unidad u opciones. Abrilo en Excel, edita, guarda como CSV y corre:

    node tools/catalog.js import   # CSV -> js/modules.js
    node tools/catalog.js export   # js/modules.js -> CSV


## Admin: curate the offer

Open `admin.html` (locally or at the Pages URL) to see every module with its price, edit title, tagline, description, prices and build weeks (also per-unit and tier prices), remove modules from the offer (with undo/redo and restore), and see the final maximum price. Edits are stored in the browser (localStorage) and hide those modules in the configurator on the same browser. To make it permanent, download the filtered `catalog.csv` from the admin page, replace the file and run `node tools/catalog.js import`.
