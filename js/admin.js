(function () {
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const KEY = "alc_removed";
  const catName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

  let removed = new Set();
  try { removed = new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch {}
  const undo = [], redo = [];

  const persist = () => localStorage.setItem(KEY, JSON.stringify([...removed]));
  const snapshot = () => new Set(removed);
  function apply(next) {
    undo.push(snapshot()); redo.length = 0;
    removed = next; persist(); render();
  }
  const dependents = (id) => MODULES.filter((m) => (m.requires || []).includes(id)).map((m) => m.id);
  function remove(id) {
    const next = snapshot(); const queue = [id];
    while (queue.length) { const x = queue.pop(); if (!next.has(x)) { next.add(x); queue.push(...dependents(x)); } }
    apply(next);
  }
  function restore(id) {
    const next = snapshot(); const queue = [id];
    while (queue.length) { const x = queue.pop(); if (next.delete(x)) queue.push(...(MODULES.find((m) => m.id === x).requires || [])); }
    apply(next);
  }
  function step(from, to) {
    if (!from.length) return;
    to.push(snapshot()); removed = from.pop(); persist(); render();
  }

  const minTier = (m) => m.tier ? m.tier.options.reduce((a, o) => (o.oneTime + o.monthly * 12 < a.oneTime + a.monthly * 12 ? o : a)) : null;
  const priceOf = (m) => {
    const q = m.qty ? (m.qty.default ?? m.qty.min) : 0;
    const t = minTier(m);
    return { one: m.oneTime + (m.qty ? q * m.qty.unit : 0) + (t ? t.oneTime : 0), mon: m.monthly + (m.qty ? q * (m.qty.unitMonthly || 0) : 0) + (t ? t.monthly : 0) };
  };
  const priceLabel = (m) => {
    if (m.qty) return `${fmt(m.qty.unit)}/u${m.qty.unitMonthly ? ` + ${fmt(m.qty.unitMonthly)}/mes` : ""} <span class="tag">×${m.qty.default ?? m.qty.min} default</span>`;
    if (m.tier) { const os = m.tier.options; return `${fmt(Math.min(...os.map((o) => o.oneTime)))}–${fmt(Math.max(...os.map((o) => o.oneTime)))}${os.some((o) => o.monthly) ? `<br><small>${fmt(Math.min(...os.map((o) => o.monthly)))}–${fmt(Math.max(...os.map((o) => o.monthly)))}/mes</small>` : ""} <span class="tag">${os.length} tiers</span>`; }
    return `${fmt(m.oneTime)}${m.monthly ? `<br><small>${fmt(m.monthly)}/mes</small>` : ""}`;
  };

  function render() {
    const q = $("#q").value.trim().toLowerCase();
    const showRemoved = $("#show-removed").checked;
    $("#list").innerHTML = CATEGORIES.map((c) => {
      const mods = MODULES.filter((m) => m.cat === c.id && (showRemoved || !removed.has(m.id)) && (!q || (m.name + m.tagline + m.desc).toLowerCase().includes(q)));
      if (!mods.length) return "";
      const live = MODULES.filter((m) => m.cat === c.id && !removed.has(m.id)).length;
      return `<div class="adm-cat"><h2>${c.icon} ${c.name} <small>· ${live} ofrecidos</small></h2>
        <table class="adm-t"><thead><tr><th>Módulo</th><th style="text-align:right">Precio</th><th>Semanas</th><th></th></tr></thead><tbody>
        ${mods.map((m) => `<tr class="${removed.has(m.id) ? "removed" : ""}">
          <td class="name"><b>${m.name}${m.locked ? '<span class="tag">incluido</span>' : ""}</b><span>${m.tagline}</span>${(m.requires || []).length ? `<i>requiere: ${m.requires.map((r) => MODULES.find((x) => x.id === r)?.name || r).join(", ")}</i>` : ""}</td>
          <td class="num">${priceLabel(m)}</td><td>${m.weeks || "—"}</td>
          <td style="text-align:right;white-space:nowrap">${removed.has(m.id)
            ? `<button class="ok" data-restore="${m.id}">Restaurar</button>`
            : m.locked ? "" : `<button class="danger" data-remove="${m.id}">Eliminar</button>`}</td>
        </tr>`).join("")}</tbody></table></div>`;
    }).join("");

    const live = MODULES.filter((m) => !removed.has(m.id));
    const tot = live.reduce((a, m) => { const p = priceOf(m); a.one += p.one; a.mon += p.mon; return a; }, { one: 0, mon: 0 });
    $("#s-count").textContent = `${live.length} / ${MODULES.length}`;
    $("#s-removed").textContent = removed.size;
    $("#s-one").textContent = fmt(tot.one);
    $("#s-mon").textContent = fmt(tot.mon) + "/mes";
    $("#s-max").textContent = `${fmt(tot.one)} USD`;
    $("#undo").disabled = !undo.length; $("#redo").disabled = !redo.length;
    $("#restore-all").disabled = !removed.size;
    $("#removed-box").innerHTML = removed.size ? `<h3>Eliminados</h3><ul>${[...removed].map((id) => { const m = MODULES.find((x) => x.id === id); return m ? `<li><span>${m.name}</span><button class="ok" data-restore="${id}">↶</button></li>` : ""; }).join("")}</ul>` : "";
  }

  function exportCsv() {
    const COLS = ["category", "type", "id", "name", "option_id", "tagline", "description", "one_time_usd", "monthly_usd", "weeks", "included", "requires", "preview", "min", "max", "default"];
    const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const row = (o) => COLS.map((c) => esc(o[c])).join(",");
    const lines = [COLS.join(",")];
    for (const m of MODULES.filter((x) => !removed.has(x.id))) {
      const category = catName[m.cat];
      lines.push(row({ category, type: "module", id: m.id, name: m.name, tagline: m.tagline, description: m.desc, one_time_usd: m.oneTime, monthly_usd: m.monthly, weeks: m.weeks, included: m.locked ? "yes" : "no", requires: (m.requires || []).join(";"), preview: m.preview || "" }));
      if (m.qty) lines.push(row({ category, type: "quantity", id: m.id, name: m.qty.label, one_time_usd: m.qty.unit, monthly_usd: m.qty.unitMonthly || 0, min: m.qty.min, max: m.qty.max, default: m.qty.default ?? m.qty.min }));
      if (m.tier) for (const o of m.tier.options) lines.push(row({ category, type: "tier", id: m.id, name: o.name, option_id: o.id, tagline: m.tier.label, one_time_usd: o.oneTime, monthly_usd: o.monthly }));
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" }));
    a.download = "catalog.csv"; a.click(); URL.revokeObjectURL(a.href);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.remove) remove(b.dataset.remove);
    if (b.dataset.restore) restore(b.dataset.restore);
  });
  $("#undo").onclick = () => step(undo, redo);
  $("#redo").onclick = () => step(redo, undo);
  $("#restore-all").onclick = () => apply(new Set());
  $("#export-csv").onclick = exportCsv;
  $("#q").oninput = render; $("#show-removed").onchange = render;
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); e.shiftKey ? step(redo, undo) : step(undo, redo); }
  });
  render();
})();
