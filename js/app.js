(function () {
  const $ = (s) => document.querySelector(s);
  const byId = Object.fromEntries(MODULES.map((m) => [m.id, m]));
  const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");

  /* ---------- artist (from ?artist=daddy-yankee or ?daddy-yankee) ---------- */
  const ARTIST = (() => {
    const q = new URLSearchParams(location.search);
    const raw = (q.get("artist") || q.get("a") || [...q.keys()].find((k) => !q.get(k)) || "").trim();
    const name = raw
      ? raw.replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
      : "Pitbull";
    const isDefault = !raw;
    return {
      name, isDefault,
      upper: name.toUpperCase(),
      alias: isDefault ? "Mr. Worldwide" : name,
      domain: name.toLowerCase().replace(/[^a-z0-9]+/g, "") + ".com",
    };
  })();
  window.ARTIST = ARTIST;
  document.title = `Website à la carte — ${ARTIST.alias} Fan Experience`;
  $("#brand-sub").textContent = `${ARTIST.alias} · WebAR Fan Experience — interactive proposal`;
  $("#pv-domain").textContent = ARTIST.domain;

  /* ---------- state ---------- */
  const state = { on: new Set(), qty: {}, tier: {}, discount: 0, plan: 1, device: "desktop" };
  MODULES.filter((m) => m.locked).forEach((m) => state.on.add(m.id));

  const view = {
    has: (id) => state.on.has(id),
    qty: (id) => state.qty[id] ?? byId[id]?.qty?.default ?? byId[id]?.qty?.min ?? 0,
    tier: (id) => state.tier[id] ?? byId[id]?.tier?.options[0].id,
  };

  function modCost(m) {
    let one = m.oneTime, mo = m.monthly;
    if (m.qty) { const q = view.qty(m.id); one += q * m.qty.unit; mo += q * (m.qty.unitMonthly || 0); }
    if (m.tier) { const t = m.tier.options.find((o) => o.id === view.tier(m.id)); one += t.oneTime; mo += t.monthly; }
    return { one, mo };
  }
  const dependents = (id) => MODULES.filter((m) => (m.requires || []).includes(id)).map((m) => m.id);

  function toggle(id, on) {
    const m = byId[id];
    if (m.locked) return;
    if (on) {
      state.on.add(id);
      (m.requires || []).forEach((r) => toggle(r, true));
    } else {
      state.on.delete(id);
      dependents(id).forEach((d) => toggle(d, false));
    }
  }

  /* ---------- URL persistence ---------- */
  function save() {
    const parts = [...state.on].map((id) => {
      let s = id;
      if (state.qty[id] != null) s += ":q" + state.qty[id];
      if (state.tier[id]) s += ":t" + state.tier[id];
      return s;
    });
    const h = parts.join(",") + (state.discount ? "|d" + state.discount : "") + (state.plan > 1 ? "|p" + state.plan : "");
    history.replaceState(null, "", "#" + h);
  }
  function load() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return applyPreset("starter", false);
    const [mods, ...opts] = h.split("|");
    mods.split(",").forEach((tok) => {
      const [id, ...rest] = tok.split(":");
      if (!byId[id]) return;
      state.on.add(id);
      rest.forEach((r) => { if (r[0] === "q") state.qty[id] = +r.slice(1); if (r[0] === "t") state.tier[id] = r.slice(1); });
    });
    opts.forEach((o) => { if (o[0] === "d") state.discount = +o.slice(1); if (o[0] === "p") state.plan = +o.slice(1); });
    $("#discount").value = String(state.discount);
    $("#plan").value = String(state.plan);
  }

  function applyPreset(pid, render = true) {
    const p = PRESETS.find((x) => x.id === pid);
    state.on = new Set(MODULES.filter((m) => m.locked).map((m) => m.id));
    (p.modules === "all" ? MODULES.map((m) => m.id) : p.modules).forEach((id) => state.on.add(id));
    if (pid === "worldwide") { state.tier.ar_world = "volumetric"; state.tier.support = "tour"; state.qty.ar_face = 4; }
    if (render) renderAll();
  }

  /* ---------- LEFT: catalog ---------- */
  const collapsed = new Set();
  function renderCatalog() {
    const q = $("#search").value.trim().toLowerCase();
    const root = $("#catalog");
    root.innerHTML = CATEGORIES.map((c) => {
      const mods = MODULES.filter((m) => m.cat === c.id && (!q || (m.name + m.tagline + m.desc).toLowerCase().includes(q)));
      if (!mods.length) return "";
      const onCount = mods.filter((m) => state.on.has(m.id)).length;
      return `<div class="cat ${collapsed.has(c.id) && !q ? "collapsed" : ""}" data-cat="${c.id}">
        <div class="cat-head"><span class="icon">${c.icon}</span>${c.name}<span class="count">${onCount}/${mods.length}</span><span class="chev">▾</span></div>
        <div class="cat-body"><div class="cat-blurb">${c.blurb}</div>${mods.map(renderMod).join("")}</div></div>`;
    }).join("");
  }
  function renderMod(m) {
    const on = state.on.has(m.id);
    const { one, mo } = modCost(m);
    const missing = (m.requires || []).filter((r) => !state.on.has(r));
    let controls = "";
    if (m.qty) controls += `<label>${m.qty.label} <input type="number" data-qty="${m.id}" min="${m.qty.min}" max="${m.qty.max}" value="${view.qty(m.id)}" /> <span>× ${fmt(m.qty.unit)}</span></label>`;
    if (m.tier) controls += `<label>${m.tier.label} <select data-tier="${m.id}">${m.tier.options.map((o) => `<option value="${o.id}" ${view.tier(m.id) === o.id ? "selected" : ""}>${o.name} — ${o.oneTime ? fmt(o.oneTime) : ""}${o.monthly ? fmt(o.monthly) + "/mo" : ""}</option>`).join("")}</select></label>`;
    if (m.requires) controls += `<span class="req">requires: ${m.requires.map((r) => byId[r].name).join(", ")}</span>`;
    return `<div class="mod ${on ? "on" : ""} ${m.locked ? "disabled" : ""}" data-mod="${m.id}">
      <div class="mod-row">
        <input type="checkbox" data-toggle="${m.id}" ${on ? "checked" : ""} ${m.locked ? "disabled" : ""} />
        <div style="flex:1;min-width:0">
          <div class="mod-title">${m.name}${m.locked ? `<span class="lock">· included</span>` : ""}${missing.length && !on ? `<span class="lock">· needs ${byId[missing[0]].name}</span>` : ""}</div>
          <div class="mod-tag">${m.tagline}</div>
        </div>
        <div class="mod-price"><b>${one ? fmt(one) : mo ? "" : "—"}</b><small>${mo ? fmt(mo) + "/mo" : one ? "one-time" : ""}</small></div>
      </div>
      <div class="mod-desc">${m.desc}${m.weeks ? ` <em>~${m.weeks} wk</em>` : ""}</div>
      <div class="mod-controls">${controls}</div>
      <button class="mod-more" data-more="${m.id}">details ▾</button>
    </div>`;
  }

  /* ---------- CENTER: preview ---------- */
  function renderPreview() {
    const R = PREVIEW_RENDERERS;
    let html = "";
    PREVIEW_ORDER.forEach((id) => { if (state.on.has(id) && R[id]) html += R[id](view) || ""; });
    html += R.footer(view);
    const el = $("#preview");
    el.innerHTML = html;
    const sections = el.querySelectorAll("section").length;
    const px = sections * (state.device === "mobile" ? 700 : 520);
    $("#page-length").textContent = `${sections} sections · ≈ ${(px / 900).toFixed(1)} screens · scroll to explore`;
    $("#tab-sections").textContent = `${sections} sections`;
  }

  /* ---------- RIGHT: calculator ---------- */
  function renderCalc() {
    const lines = [];
    let one = 0, mo = 0, weeks = 0;
    CATEGORIES.forEach((c) => MODULES.filter((m) => m.cat === c.id && state.on.has(m.id)).forEach((m) => {
      const cost = modCost(m); one += cost.one; mo += cost.mo; weeks += m.weeks || 0;
      let detail = "";
      if (m.qty) detail = `${view.qty(m.id)} × ${m.qty.label.toLowerCase()}`;
      if (m.tier) detail = m.tier.options.find((o) => o.id === view.tier(m.id)).name;
      lines.push(`<li><span>${m.name}<em>${c.name}${detail ? " · " + detail : ""}</em></span><span class="amt">${cost.one ? fmt(cost.one) : ""}${cost.mo ? `<small>${fmt(cost.mo)}/mo</small>` : ""}${m.locked ? "" : `<button data-remove="${m.id}" title="Remove">✕</button>`}</span></li>`);
    }));
    const disc = one * state.discount;
    if (disc) lines.push(`<li class="discount"><span>Discount (${Math.round(state.discount * 100)}%)</span><span class="amt">−${fmt(disc)}</span></li>`);
    const oneNet = one - disc;
    // Parallel workstreams: effective calendar time ≈ 45% of summed effort, min 3 weeks
    const calWeeks = Math.max(3, Math.round(weeks * 0.45));

    renderBudget(oneNet);
    $("#t-onetime").textContent = fmt(oneNet);
    $("#t-monthly").innerHTML = fmt(mo) + "<small>/mo</small>";
    $("#t-year").textContent = fmt(oneNet + mo * 12);
    $("#t-weeks").textContent = `${calWeeks} weeks`;
    $("#t-count").textContent = state.on.size;
    $("#tab-count").textContent = `${state.on.size} selected`;
    $("#tab-price").textContent = fmt(oneNet);
    $("#t-budget").textContent = `${fmt(oneNet)} USD`;
    $("#mb-onetime").textContent = fmt(oneNet);
    $("#mb-monthly").textContent = `+ ${fmt(mo)}/mo`;
    $("#lines").innerHTML = lines.join("");

    const splits = { 1: [1], 2: [0.5, 0.5], 3: [0.4, 0.3, 0.3] }[state.plan];
    const labels = ["Kickoff", "Design sign-off", "Launch"];
    $("#plan-breakdown").innerHTML = splits.map((s, i) => `<span>${labels[i] || "Milestone " + (i + 1)}: <b>${fmt(oneNet * s)}</b></span>`).join("");

    const phases = [["Discovery & UX", 0.15], ["Design system", 0.15], ["Build & AR production", 0.5], ["QA & launch", 0.2]];
    $("#timeline").innerHTML = `<h3>Timeline (${calWeeks} wks, parallel streams)</h3>` + phases.map(([n, f]) => `<div class="ph"><b>${n}</b><i style="width:${f * 100}%"></i><span>${Math.max(1, Math.round(calWeeks * f))} wk</span></div>`).join("");

    document.querySelectorAll("#presets button").forEach((b) => b.classList.remove("active"));
  }

  function renderBudget(oneNet) {
    const top = BUDGETS[BUDGETS.length - 1].max;
    const band = BUDGETS.find((b) => oneNet <= b.max);
    const pct = Math.min(100, (oneNet / top) * 100);
    const over = oneNet > top;
    const mb = $("#mb-band");
    mb.textContent = band ? `${band.name} band · ${fmt(band.max - oneNet)} left` : `${fmt(oneNet - top)} over top`;
    mb.classList.toggle("over", over);
    $("#budget").innerHTML = `
      <div class="budget-head"><span>Budget band</span><b class="${over ? "over" : ""}">${band ? band.name + " · up to " + fmt(band.max) : "Over " + fmt(top)}</b></div>
      <div class="budget-bar"><i style="width:${pct}%"></i>${BUDGETS.slice(0, -1).map((b) => `<em style="left:${(b.max / top) * 100}%"></em>`).join("")}</div>
      <div class="budget-ticks">${BUDGETS.map((b) => `<span class="${band && band.id === b.id ? "cur" : ""}">${b.name} ${fmt(b.max)}</span>`).join("")}</div>
      ${band && band.max - oneNet > 0 && band.max - oneNet < 1500 ? `<div class="budget-hint">${fmt(band.max - oneNet)} left in this band</div>` : ""}
      ${over ? `<div class="budget-hint over">${fmt(oneNet - top)} above the top budget — remove modules or lower the volumetric / filter count</div>` : ""}`;
  }

  function renderAll() { renderCatalog(); renderPreview(); renderCalc(); save(); }

  /* ---------- events ---------- */
  $("#catalog").addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.toggle) toggle(t.dataset.toggle, t.checked);
    if (t.dataset.qty) { const m = byId[t.dataset.qty]; state.qty[m.id] = Math.min(m.qty.max, Math.max(m.qty.min, +t.value || 0)); }
    if (t.dataset.tier) state.tier[t.dataset.tier] = t.value;
    renderAll();
  });
  $("#catalog").addEventListener("click", (e) => {
    const head = e.target.closest(".cat-head");
    if (head) { const id = head.parentElement.dataset.cat; collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id); renderCatalog(); return; }
    if (e.target.dataset.more) { e.target.closest(".mod").classList.toggle("expanded"); return; }
    const mod = e.target.closest(".mod");
    if (mod && !e.target.closest("input,select,label,button") && !byId[mod.dataset.mod].locked) {
      toggle(mod.dataset.mod, !state.on.has(mod.dataset.mod)); renderAll();
    }
  });
  $("#search").addEventListener("input", renderCatalog);
  $("#lines").addEventListener("click", (e) => { if (e.target.dataset.remove) { toggle(e.target.dataset.remove, false); renderAll(); } });
  $("#discount").addEventListener("change", (e) => { state.discount = +e.target.value; renderCalc(); save(); });
  $("#plan").addEventListener("change", (e) => { state.plan = +e.target.value; renderCalc(); save(); });
  $("#preview").addEventListener("click", (e) => {
    const s = e.target.closest("section[data-mod]");
    if (!s) return;
    const el = document.querySelector(`.mod[data-mod="${s.dataset.mod}"]`);
    if (el) {
      if (window.matchMedia("(max-width: 860px)").matches) showTab("left");
      el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("expanded");
    }
  });
  document.querySelectorAll("[data-device]").forEach((b) => b.addEventListener("click", () => {
    state.device = b.dataset.device;
    document.querySelectorAll("[data-device]").forEach((x) => x.classList.toggle("active", x === b));
    $("#device-frame").classList.toggle("mobile", state.device === "mobile");
    renderPreview();
  }));
  $("#presets").innerHTML = PRESETS.map((p) => `<button data-preset="${p.id}" title="${p.blurb}">${p.name}</button>`).join("");
  $("#presets").addEventListener("click", (e) => { if (e.target.dataset.preset) { applyPreset(e.target.dataset.preset); e.target.classList.add("active"); } });
  $("#btn-reset").addEventListener("click", () => { state.on = new Set(MODULES.filter((m) => m.locked).map((m) => m.id)); state.qty = {}; state.tier = {}; renderAll(); });
  $("#btn-share").addEventListener("click", async () => {
    save();
    try { await navigator.clipboard.writeText(location.href); toast("Link copied — send it to the client"); }
    catch { toast("Copy this URL from the address bar"); }
  });
  $("#btn-export").addEventListener("click", () => window.print());

  /* mobile tabs */
  function showTab(tab) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("show", p.classList.contains("panel-" + tab)));
    document.querySelectorAll("#mobile-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  }
  document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200); }

  load();
  renderAll();
})();
