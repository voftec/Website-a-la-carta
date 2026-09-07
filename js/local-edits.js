/* Local edits made in admin.html (stored in this browser's localStorage):
 *   removed:   [module id, ...]
 *   overrides: { [module id]: { name, tagline, desc, oneTime, monthly, weeks,
 *                               qty: { unit, unitMonthly, default }, tier: { [option id]: { name, oneTime, monthly } } } }
 */
window.LOCAL_EDITS = (() => {
  const KEY = "alc_edits";
  const LEGACY = "alc_removed";
  function load() {
    let e = { removed: [], overrides: {} };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) e = { removed: [], overrides: {}, ...JSON.parse(raw) };
      else if (localStorage.getItem(LEGACY)) e.removed = JSON.parse(localStorage.getItem(LEGACY));
    } catch {}
    return e;
  }
  const save = (e) => { localStorage.setItem(KEY, JSON.stringify(e)); localStorage.removeItem(LEGACY); };

  /* Return a deep copy of a module with its overrides applied */
  function patch(m, o) {
    if (!o) return m;
    const r = { ...m };
    for (const k of ["name", "tagline", "desc", "oneTime", "monthly", "days", "ext", "extNote"]) if (o[k] != null && o[k] !== "") r[k] = k === "name" || k === "tagline" || k === "desc" || k === "extNote" ? String(o[k]) : Number(o[k]);
    if (m.qty && o.qty) r.qty = { ...m.qty, ...Object.fromEntries(Object.entries(o.qty).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, k === "label" ? String(v) : Number(v)])) };
    if (m.tier && o.tier) r.tier = { ...m.tier, options: m.tier.options.map((op) => {
      const t = o.tier[op.id]; if (!t) return op;
      return { ...op, name: t.name != null && t.name !== "" ? String(t.name) : op.name,
        oneTime: t.oneTime != null && t.oneTime !== "" ? Number(t.oneTime) : op.oneTime,
        monthly: t.monthly != null && t.monthly !== "" ? Number(t.monthly) : op.monthly };
    }) };
    return r;
  }

  /* Mutate window.MODULES / window.PRESETS for the configurator */
  function apply() {
    const e = load();
    const removed = new Set(e.removed);
    let changed = true;
    while (changed) {
      changed = false;
      window.MODULES.forEach((m) => { if (!removed.has(m.id) && (m.requires || []).some((r) => removed.has(r))) { removed.add(m.id); changed = true; } });
    }
    window.MODULES = window.MODULES.filter((m) => !removed.has(m.id)).map((m) => patch(m, e.overrides[m.id]));
    window.PRESETS.forEach((p) => { if (Array.isArray(p.modules)) p.modules = p.modules.filter((id) => !removed.has(id)); });
  }
  return { load, save, patch, apply };
})();
