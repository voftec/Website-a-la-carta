(function () {
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const catName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /* ---------- state: { removed:[], overrides:{} } + undo/redo ---------- */
  let edits = LOCAL_EDITS.load();
  const undo = [], redo = [];
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const open = new Set();
  function commit(next) { undo.push(clone(edits)); redo.length = 0; edits = next; LOCAL_EDITS.save(edits); render(); }
  function step(from, to) { if (!from.length) return; to.push(clone(edits)); edits = from.pop(); LOCAL_EDITS.save(edits); render(); }

  const removed = () => new Set(edits.removed);
  const mod = (id) => MODULES.find((m) => m.id === id);
  const current = (m) => LOCAL_EDITS.patch(m, edits.overrides[m.id]);
  const isEdited = (id) => !!edits.overrides[id] && JSON.stringify(current(mod(id))) !== JSON.stringify(mod(id));
  const dependents = (id) => MODULES.filter((m) => (m.requires || []).includes(id)).map((m) => m.id);

  function remove(id) {
    const next = clone(edits); const set = new Set(next.removed); const queue = [id];
    while (queue.length) { const x = queue.pop(); if (!set.has(x)) { set.add(x); queue.push(...dependents(x)); } }
    next.removed = [...set]; commit(next);
  }
  function restore(id) {
    const next = clone(edits); const set = new Set(next.removed); const queue = [id];
    while (queue.length) { const x = queue.pop(); if (set.delete(x)) queue.push(...(mod(x).requires || [])); }
    next.removed = [...set]; commit(next);
  }
  /* path like "name", "qty.unit", "tier.pro.monthly" */
  function setField(id, path, value) {
    const next = clone(edits);
    const keys = path.split("."); let o = (next.overrides[id] ||= {});
    for (const k of keys.slice(0, -1)) o = (o[k] ||= {});
    o[keys.at(-1)] = value;
    commit(next);
  }
  function resetModule(id) { const next = clone(edits); delete next.overrides[id]; commit(next); }

  /* ---------- pricing summary ---------- */
  const cheapestTier = (m) => m.tier ? m.tier.options.reduce((a, o) => (o.oneTime + o.monthly * 12 < a.oneTime + a.monthly * 12 ? o : a)) : null;
  const priceOf = (m) => {
    const q = m.qty ? (m.qty.default ?? m.qty.min) : 0, t = cheapestTier(m);
    return { one: m.oneTime + (m.qty ? q * m.qty.unit : 0) + (t ? t.oneTime : 0), mon: m.monthly + (m.qty ? q * (m.qty.unitMonthly || 0) : 0) + (t ? t.monthly : 0), ext: m.ext || 0 };
  };
  const priceLabel = (m) => {
    if (m.qty) return `${fmt(m.qty.unit)}/u${m.qty.unitMonthly ? ` + ${fmt(m.qty.unitMonthly)}/mes` : ""}<br><small>×${m.qty.default ?? m.qty.min} default${m.oneTime ? ` + ${fmt(m.oneTime)} base` : ""}</small>`;
    if (m.tier) { const os = m.tier.options; return `${fmt(Math.min(...os.map((o) => o.oneTime)))}–${fmt(Math.max(...os.map((o) => o.oneTime)))}${os.some((o) => o.monthly) ? `<br><small>${fmt(Math.min(...os.map((o) => o.monthly)))}–${fmt(Math.max(...os.map((o) => o.monthly)))}/mes</small>` : ""}<br><small>${os.length} tiers</small>`; }
    return `${fmt(m.oneTime)}${m.monthly ? `<br><small>${fmt(m.monthly)}/mes</small>` : ""}`;
  };
  const extLabel = (m) => m.ext || m.extNote ? `<small class="ext">+ ${fmt(m.ext || 0)}/mes terceros</small>` : "";

  /* ---------- editor ---------- */
  const F = (id, path, label, value, type = "text", extra = "") =>
    `<label class="f ${type === "textarea" ? "wide" : ""}"><span>${label}</span>${type === "textarea"
      ? `<textarea data-id="${id}" data-path="${path}" rows="3">${esc(value)}</textarea>`
      : `<input type="${type}" data-id="${id}" data-path="${path}" value="${esc(value)}" ${extra} />`}</label>`;
  function editor(m0) {
    const m = current(m0), id = m.id;
    let h = `<div class="editor"><div class="grid">
      ${F(id, "name", "Título", m.name)}
      ${F(id, "tagline", "Tagline", m.tagline)}
      ${F(id, "desc", "Descripción", m.desc, "textarea")}
      ${F(id, "oneTime", m.qty ? "Precio base único (USD)" : "Precio único (USD)", m.oneTime, "number", 'min="0" step="10"')}
      ${F(id, "monthly", "Mensual (USD)", m.monthly, "number", 'min="0" step="5"')}
      ${F(id, "days", "Duración desarrollo (días)", m.days, "number", 'min="0" step="1"')}
      ${F(id, "ext", "Servicios de terceros (USD/mes, a costo)", m.ext || 0, "number", 'min="0" step="1"')}
      ${F(id, "extNote", "Qué servicio de terceros (se muestra al cliente)", m.extNote || "")}
    </div>`;
    if (m.qty) h += `<h4>Por unidad — ${esc(m.qty.label)}</h4><div class="grid">
      ${F(id, "qty.label", "Etiqueta", m.qty.label)}
      ${F(id, "qty.unit", "Precio por unidad (USD)", m.qty.unit, "number", 'min="0" step="10"')}
      ${F(id, "qty.unitMonthly", "Mensual por unidad (USD)", m.qty.unitMonthly || 0, "number", 'min="0" step="5"')}
      ${F(id, "qty.default", `Cantidad por defecto (${m.qty.min}–${m.qty.max})`, m.qty.default ?? m.qty.min, "number", `min="${m.qty.min}" max="${m.qty.max}"`)}
    </div>`;
    if (m.tier) h += `<h4>Tiers — ${esc(m.tier.label)}</h4>` + m.tier.options.map((o) => `<div class="grid tier">
      ${F(id, `tier.${o.id}.name`, "Nombre", o.name)}
      ${F(id, `tier.${o.id}.oneTime`, "Único (USD)", o.oneTime, "number", 'min="0" step="10"')}
      ${F(id, `tier.${o.id}.monthly`, "Mensual (USD)", o.monthly, "number", 'min="0" step="5"')}
    </div>`).join("");
    h += `<div class="ed-actions">${isEdited(id) ? `<button data-reset="${id}">Volver al original</button>` : ""}<button data-close="${id}">Cerrar</button></div></div>`;
    return h;
  }

  /* ---------- render ---------- */
  function render() {
    const q = $("#q").value.trim().toLowerCase();
    const showRemoved = $("#show-removed").checked;
    const rm = removed();
    $("#list").innerHTML = CATEGORIES.map((c) => {
      const mods = MODULES.filter((m) => m.cat === c.id && (showRemoved || !rm.has(m.id))).map(current)
        .filter((m) => !q || (m.name + m.tagline + m.desc).toLowerCase().includes(q));
      if (!mods.length) return "";
      const live = MODULES.filter((m) => m.cat === c.id && !rm.has(m.id)).length;
      return `<div class="adm-cat"><h2>${c.icon} ${c.name} <small>· ${live} ofrecidos</small></h2>
        <table class="adm-t"><thead><tr><th>Módulo</th><th style="text-align:right">Precio</th><th>Días</th><th></th></tr></thead><tbody>
        ${mods.map((m) => `<tr class="${rm.has(m.id) ? "removed" : ""} ${open.has(m.id) ? "open" : ""}" data-row="${m.id}">
          <td class="name"><b>${esc(m.name)}${m.locked ? '<span class="tag">incluido</span>' : ""}${isEdited(m.id) ? '<span class="tag ed">editado</span>' : ""}</b><span>${esc(m.tagline)}</span>${(m.requires || []).length ? `<i>requiere: ${m.requires.map((r) => esc(mod(r)?.name || r)).join(", ")}</i>` : ""}</td>
          <td class="num">${priceLabel(m)}${extLabel(m)}</td><td>${m.days || "—"}</td>
          <td class="acts">${rm.has(m.id)
            ? `<button class="ok" data-restore="${m.id}">Restaurar</button>`
            : `<button data-edit="${m.id}">${open.has(m.id) ? "Cerrar" : "Editar"}</button>${m.locked ? "" : `<button class="danger" data-remove="${m.id}">Eliminar</button>`}`}</td>
        </tr>${open.has(m.id) && !rm.has(m.id) ? `<tr class="edrow"><td colspan="4">${editor(mod(m.id))}</td></tr>` : ""}`).join("")}</tbody></table></div>`;
    }).join("");

    const live = MODULES.filter((m) => !rm.has(m.id)).map(current);
    const tot = live.reduce((a, m) => { const p = priceOf(m); a.one += p.one; a.mon += p.mon; a.ext += p.ext; a.d += m.days || 0; return a; }, { one: 0, mon: 0, ext: 0, d: 0 });
    $("#s-count").textContent = `${live.length} / ${MODULES.length}`;
    $("#s-removed").textContent = rm.size;
    $("#s-edited").textContent = Object.keys(edits.overrides).filter(isEdited).length;
    $("#s-one").textContent = fmt(tot.one);
    $("#s-mon").textContent = fmt(tot.mon) + "/mes";
    $("#s-ext").textContent = fmt(tot.ext) + "/mes";
    $("#s-weeks").textContent = `${tot.d} días (≈ ${Math.round(tot.d / 7)} sem)`;
    $("#s-max").textContent = `${fmt(tot.one)} USD`;
    $("#undo").disabled = !undo.length; $("#redo").disabled = !redo.length;
    $("#restore-all").disabled = !rm.size && !Object.keys(edits.overrides).length;
    $("#removed-box").innerHTML = rm.size ? `<h3>Eliminados</h3><ul>${[...rm].map((id) => { const m = mod(id); return m ? `<li><span>${esc(m.name)}</span><button class="ok" data-restore="${id}">↶</button></li>` : ""; }).join("")}</ul>` : "";
  }

  /* ---------- CSV export (current offer with edits) ---------- */
  function exportCsv() {
    const COLS = ["category", "type", "id", "name", "option_id", "tagline", "description", "one_time_usd", "monthly_usd", "third_party_monthly_usd", "third_party_note", "days", "included", "requires", "preview", "min", "max", "default"];
    const e = (v) => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const row = (o) => COLS.map((c) => e(o[c])).join(",");
    const lines = [COLS.join(",")], rm = removed();
    for (const m of MODULES.filter((x) => !rm.has(x.id)).map(current)) {
      const category = catName[m.cat];
      lines.push(row({ category, type: "module", id: m.id, name: m.name, tagline: m.tagline, description: m.desc, one_time_usd: m.oneTime, monthly_usd: m.monthly, third_party_monthly_usd: m.ext || 0, third_party_note: m.extNote || "", days: m.days, included: m.locked ? "yes" : "no", requires: (m.requires || []).join(";"), preview: m.preview || "" }));
      if (m.qty) lines.push(row({ category, type: "quantity", id: m.id, name: m.qty.label, one_time_usd: m.qty.unit, monthly_usd: m.qty.unitMonthly || 0, min: m.qty.min, max: m.qty.max, default: m.qty.default ?? m.qty.min, tagline: (m.qty.included || []).join(";"), option_id: (m.qty.options || []).join(";") }));
      if (m.tier) for (const o of m.tier.options) lines.push(row({ category, type: "tier", id: m.id, name: o.name, option_id: o.id, tagline: m.tier.label, one_time_usd: o.oneTime, monthly_usd: o.monthly }));
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" }));
    a.download = "catalog.csv"; a.click(); URL.revokeObjectURL(a.href);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    if (d.remove) remove(d.remove);
    if (d.restore) restore(d.restore);
    if (d.edit) { open.has(d.edit) ? open.delete(d.edit) : open.add(d.edit); render(); }
    if (d.close) { open.delete(d.close); render(); }
    if (d.reset) resetModule(d.reset);
  });
  /* save a field when the user leaves it (one undo step per field) */
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t.dataset.path) return;
    const m = current(mod(t.dataset.id));
    let v = t.type === "number" ? (t.value === "" ? "" : Number(t.value)) : t.value;
    if (t.dataset.path === "qty.default" && v !== "") v = Math.min(m.qty.max, Math.max(m.qty.min, v));
    setField(t.dataset.id, t.dataset.path, v);
    const again = document.querySelector(`[data-id="${t.dataset.id}"][data-path="${t.dataset.path}"]`); if (again) again.focus();
  });
  $("#undo").onclick = () => step(undo, redo);
  $("#redo").onclick = () => step(redo, undo);
  $("#restore-all").onclick = () => { if (confirm("¿Restaurar todos los módulos y descartar todas las ediciones?")) commit({ removed: [], overrides: {} }); };
  $("#export-csv").onclick = exportCsv;
  $("#q").oninput = render; $("#show-removed").onchange = render;
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); e.shiftKey ? step(redo, undo) : step(undo, redo); }
  });
  render();
})();
