#!/usr/bin/env node
/*
 * Round-trip the module catalog between js/modules.js and catalog.csv.
 *
 *   node tools/catalog.js export   -> writes catalog.csv from js/modules.js
 *   node tools/catalog.js import   -> rewrites window.MODULES in js/modules.js from catalog.csv
 *
 * CSV layout (UTF-8, comma separated; Google Sheets: =IMPORTDATA("<pages-url>/catalog.csv")):
 *   category  category name
 *   type      module | quantity | tier
 *   id        module id (for quantity/tier rows: the parent module id)
 *   name      module name / quantity label / tier option name
 *   option_id tier option id (tier rows only)
 *   tagline, description
 *   one_time_usd, monthly_usd   module base price / per-unit price / tier price
 *   weeks     build effort (module rows)
 *   included  yes = always on and cannot be removed
 *   requires  module ids separated by ;
 *   preview   renderer key in js/preview.js (leave as is)
 *   min, max, default   quantity rows only
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const MOD_PATH = path.join(root, "js", "modules.js");
const CSV_PATH = path.join(root, "catalog.csv");
const COLS = ["category", "type", "id", "name", "option_id", "tagline", "description", "one_time_usd", "monthly_usd", "weeks", "included", "requires", "preview", "min", "max", "default"];

function loadCatalog() {
  const w = {};
  new Function("window", fs.readFileSync(MOD_PATH, "utf8"))(w);
  return w;
}
const esc = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (o) => COLS.map((c) => esc(o[c])).join(",");

function exportCsv() {
  const { CATEGORIES, MODULES } = loadCatalog();
  const cat = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
  const lines = [COLS.join(",")];
  for (const m of MODULES) {
    lines.push(row({ type: "module", id: m.id, category: cat[m.cat], name: m.name, tagline: m.tagline, description: m.desc,
      one_time_usd: m.oneTime, monthly_usd: m.monthly, weeks: m.weeks, included: m.locked ? "yes" : "no",
      requires: (m.requires || []).join(";"), preview: m.preview || "" }));
    if (m.qty) lines.push(row({ category: cat[m.cat], type: "quantity", id: m.id, name: m.qty.label, one_time_usd: m.qty.unit, monthly_usd: m.qty.unitMonthly || 0,
      min: m.qty.min, max: m.qty.max, default: m.qty.default ?? m.qty.min }));
    if (m.tier) for (const o of m.tier.options)
      lines.push(row({ category: cat[m.cat], type: "tier", id: m.id, name: o.name, option_id: o.id, tagline: m.tier.label, one_time_usd: o.oneTime, monthly_usd: o.monthly }));
  }
  fs.writeFileSync(CSV_PATH, lines.join("\n") + "\n");
  console.log(`wrote ${CSV_PATH} (${MODULES.length} modules, ${lines.length - 1} rows)`);
}

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/)[0];
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let cur = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === sep) { cur.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; cur.push(field); field = ""; if (cur.some((x) => x !== "")) rows.push(cur); cur = []; }
    else field += c;
  }
  if (field || cur.length) { cur.push(field); if (cur.some((x) => x !== "")) rows.push(cur); }
  const head = rows.shift().map((h) => h.trim().toLowerCase());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}
const num = (v) => { const n = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };
const js = (v) => JSON.stringify(v);

function importCsv() {
  const { CATEGORIES } = loadCatalog();
  const catByName = Object.fromEntries(CATEGORIES.map((c) => [c.name.toLowerCase(), c.id]));
  const catIds = new Set(CATEGORIES.map((c) => c.id));
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const mods = [], byId = {};
  for (const r of rows) {
    if (r.type === "module") {
      const cat = catIds.has(r.category) ? r.category : catByName[r.category.toLowerCase()];
      if (!cat) throw new Error(`Unknown category "${r.category}" for module ${r.id}`);
      const m = { id: r.id, cat, name: r.name, tagline: r.tagline, desc: r.description, oneTime: num(r.one_time_usd), monthly: num(r.monthly_usd), weeks: num(r.weeks) };
      if (/^(yes|si|sí|true|1|x)$/i.test(r.included)) m.locked = true;
      if (r.requires) m.requires = r.requires.split(/[;|]/).map((s) => s.trim()).filter(Boolean);
      m.preview = r.preview || null;
      mods.push(m); byId[m.id] = m;
    } else if (r.type === "quantity") {
      const m = byId[r.id]; if (!m) throw new Error(`quantity row before module ${r.id}`);
      m.qty = { label: r.name, min: num(r.min), max: num(r.max), unit: num(r.one_time_usd), unitMonthly: num(r.monthly_usd) };
      if (r.default !== "" && num(r.default) !== m.qty.min) m.qty.default = num(r.default);
    } else if (r.type === "tier") {
      const m = byId[r.id]; if (!m) throw new Error(`tier row before module ${r.id}`);
      m.tier = m.tier || { label: r.tagline || "Option", options: [] };
      m.tier.options.push({ id: r.option_id || r.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"), name: r.name, oneTime: num(r.one_time_usd), monthly: num(r.monthly_usd) });
    }
  }
  const src = mods.map((m) => {
    const parts = [`id: ${js(m.id)}`, `cat: ${js(m.cat)}`];
    if (m.locked) parts.push("locked: true");
    parts.push(`name: ${js(m.name)}`, `tagline: ${js(m.tagline)}`, `\n    desc: ${js(m.desc)}`, `oneTime: ${m.oneTime}`, `monthly: ${m.monthly}`, `weeks: ${m.weeks}`);
    if (m.requires) parts.push(`\n    requires: ${js(m.requires)}`);
    if (m.qty) parts.push(`qty: ${js(m.qty)}`);
    if (m.tier) parts.push(`tier: { label: ${js(m.tier.label)}, options: [\n      ${m.tier.options.map(js).join(",\n      ")} ] }`);
    parts.push(`preview: ${js(m.preview)}`);
    return `  { ${parts.join(", ")} }`;
  }).join(",\n");
  const file = fs.readFileSync(MOD_PATH, "utf8");
  const start = file.indexOf("window.MODULES = [");
  const end = file.indexOf("\n];", start) + 3;
  fs.writeFileSync(MOD_PATH, file.slice(0, start) + "window.MODULES = [\n" + src + ",\n];" + file.slice(end));
  console.log(`updated ${MOD_PATH} with ${mods.length} modules from catalog.csv`);
}

const cmd = process.argv[2];
if (cmd === "export") exportCsv();
else if (cmd === "import") importCsv();
else { console.log("usage: node tools/catalog.js export|import"); process.exit(1); }
