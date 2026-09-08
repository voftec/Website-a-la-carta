(function () {
  const $ = (s) => document.querySelector(s);

  /* ---------- edits made in admin.html (localStorage) ---------- */
  LOCAL_EDITS.apply();
  const MODULES = window.MODULES;
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
  const platformOperator = 25;
  const rushFee = 15;
  const state = { on: new Set(), qty: {}, tier: {}, pick: {}, discount: 0, plan: 1, device: "desktop" };
  MODULES.filter((m) => m.locked).forEach((m) => state.on.add(m.id));

  const view = {
    has: (id) => id === "ar_hub" ? MODULES.some((m) => m.cat === "ar" && state.on.has(m.id)) : state.on.has(id),
    qty: (id) => byId[id]?.qty?.options ? view.picks(id).length : (state.qty[id] ?? byId[id]?.qty?.default ?? byId[id]?.qty?.min ?? 0),
    picks: (id) => state.pick[id] || [],
    tier: (id) => state.tier[id] ?? byId[id]?.tier?.options[0].id,
  };

  function modDays(m) {
    if (m.id === "i18n") return view.picks(m.id).length ? 2 : 1;
    return m.days || 0;
  }
  function modCost(m) {
    let one = m.oneTime, mo = m.monthly;
    if (m.qty) { const q = view.qty(m.id); one += q * m.qty.unit; mo += q * (m.qty.unitMonthly || 0); }
    if (m.tier) { const t = m.tier.options.find((o) => o.id === view.tier(m.id)); one += t.oneTime; mo += t.monthly; }
    return { one, mo, ext: m.ext || 0 };
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
      if (state.pick[id]?.length) s += ":l" + state.pick[id].map((n) => byId[id].qty.options.indexOf(n)).join(".");
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
      rest.forEach((r) => {
        if (r[0] === "q") state.qty[id] = +r.slice(1);
        if (r[0] === "t") state.tier[id] = r.slice(1);
        if (r[0] === "l" && byId[id].qty?.options) state.pick[id] = r.slice(1).split(".").map((i) => byId[id].qty.options[+i]).filter(Boolean);
      });
    });
    opts.forEach((o) => { if (o[0] === "d") state.discount = +o.slice(1); if (o[0] === "p") state.plan = +o.slice(1); });
  }

  function applyPreset(pid, render = true) {
    const p = PRESETS.find((x) => x.id === pid);
    state.on = new Set(MODULES.filter((m) => m.locked).map((m) => m.id));
    state.tier = {}; state.pick = {}; state.qty = {};
    (p.modules === "all" ? MODULES.map((m) => m.id) : p.modules).forEach((id) => state.on.add(id));
    if (pid === "worldwide") { state.tier.capture = "eu"; state.pick.i18n = ["Portuguese", "French", "Italian", "German"]; }
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
    if (m.qty?.options) {
      const picks = view.picks(m.id);
      const left = m.qty.options.filter((o) => !picks.includes(o));
      controls += `<div class="picks">${(m.qty.included || []).map((o) => `<span class="chip inc">${o}</span>`).join("")}${picks.map((o) => `<span class="chip">${o} <button data-unpick="${m.id}" data-val="${o}" title="Remove">✕</button></span>`).join("")}</div>
        ${left.length && picks.length < m.qty.max ? `<label>${m.qty.label} <select data-pick="${m.id}"><option value="">+ Add language (${fmt(m.qty.unit)} each)</option>${left.map((o) => `<option>${o}</option>`).join("")}</select></label>` : ""}`;
    } else if (m.qty) controls += `<label>${m.qty.label} <input type="number" data-qty="${m.id}" min="${m.qty.min}" max="${m.qty.max}" value="${view.qty(m.id)}" /> <span>× ${fmt(m.qty.unit)}</span></label>`;
    if (m.tier) controls += `<label>${m.tier.label} <select data-tier="${m.id}">${m.tier.options.map((o) => `<option value="${o.id}" ${view.tier(m.id) === o.id ? "selected" : ""}>${o.name}${o.oneTime || o.monthly ? " — " : " (included)"}${o.oneTime ? "+" + fmt(o.oneTime) : ""}${o.monthly ? fmt(o.monthly) + "/mo" : ""}</option>`).join("")}</select></label>`;
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
      <div class="mod-desc">${m.desc}${modDays(m) ? ` <em>~${modDays(m)} day${modDays(m) === 1 ? "" : "s"}</em>` : ""}${m.ext || m.extNote ? `<div class="mod-ext">Third-party: <b>${m.ext ? fmt(m.ext) + "/mo" : "monthly plan to be discussed"}</b> - ${m.extNote || ""}</div>` : ""}${arRefs(m)}</div>
      <div class="mod-controls">${controls}</div>
      <button class="mod-more" data-more="${m.id}">details ▾</button>
    </div>`;
  }

  function arRefs(m) {
    const ar = window.AR_MEDIA && AR_MEDIA[m.id];
    if (!ar) return "";
    const vids = ar.videos.map((v) => `<figure><video src="${v.src}" muted loop playsinline preload="metadata" controls></video><figcaption><b>${v.label}</b>${v.effect}</figcaption></figure>`).join("");
    return `<div class="ar-refs">
      <button type="button" class="ar-refs-toggle" data-arrefs="${m.id}">Reference videos & effect ${ar.videos.length ? `(${ar.videos.length})` : ""} <span>\u25BE</span></button>
      <div class="ar-refs-body">
        <div class="ar-what"><span class="pill">${ar.camera}</span>${ar.what}</div>
        ${vids ? `<div class="ar-strip">${vids}</div>` : `<div class="ar-none">Reference video coming soon.</div>`}
      </div>
    </div>`;
  }

  /* ---------- CENTER: preview ---------- */
  function renderPreview() {
    const R = PREVIEW_RENDERERS;
    let html = "";
    PREVIEW_ORDER.forEach((id) => { if (view.has(id) && R[id]) html += R[id](view) || ""; });
    html += R.footer(view);
    const el = $("#preview");
    el.innerHTML = html;
    if (window.mountGlobe) el.querySelectorAll(".globe3d").forEach((g) => window.mountGlobe(g));
    const sections = el.querySelectorAll("section").length;
    const px = sections * (state.device === "mobile" ? 700 : 520);
    $("#page-length").textContent = `${sections} sections · ≈ ${(px / 900).toFixed(1)} screens · scroll to explore`;
    $("#tab-sections").textContent = `${sections} sections`;
  }

  /* ---------- RIGHT: calculator ---------- */
  function renderCalc() {
    const lines = [];
    let one = 0, mo = 0, ext = 0, days = 0;
    const extLines = [], effort = [];
    CATEGORIES.forEach((c) => MODULES.filter((m) => m.cat === c.id && state.on.has(m.id)).forEach((m) => {
      const cost = modCost(m); one += cost.one; mo += cost.mo; ext += cost.ext; const md = modDays(m); days += md; if (md) effort.push([m.name, md]);
      if (m.ext || m.extNote) extLines.push(`<li class="ext"><span>${m.name}<em>${m.extNote || ""}</em></span><span class="amt">${m.ext ? `<small>${fmt(m.ext)}/mo</small>` : "<small>To be discussed</small>"}</span></li>`);
      let detail = "";
      if (m.qty?.options) detail = [...(m.qty.included || []), ...view.picks(m.id)].join(", ");
      else if (m.qty) detail = `${view.qty(m.id)} × ${m.qty.label.toLowerCase()}`;
      if (m.tier) detail = m.tier.options.find((o) => o.id === view.tier(m.id)).name;
      lines.push(`<li><span>${m.name}<em>${c.name}${detail ? " · " + detail : ""}</em></span><span class="amt">${cost.one ? fmt(cost.one) : cost.mo ? "" : "Included"}${cost.mo ? `<small>${fmt(cost.mo)}/mo</small>` : ""}${m.locked ? "" : `<button data-remove="${m.id}" title="Remove">✕</button>`}</span></li>`);
    }));
    const oneOp = Math.round(one * (1 + platformOperator / 100));
    const rush = Math.round(oneOp * rushFee / 100);
    const oneNet = oneOp; // rush fee is added then cancelled by the PITCOIN coupon
    mo = Math.round(mo * (1 + platformOperator / 100));
    const weeks = days / 7;
    const weeksTxt = Number.isInteger(weeks) ? `${weeks} week${weeks === 1 ? "" : "s"}` : `${weeks.toFixed(1)} weeks`;

    $("#t-onetime").textContent = fmt(oneNet);
    $("#t-monthly").innerHTML = fmt(mo) + "<small>/mo</small>";
    $("#t-monthly").closest(".total-card").hidden = !mo;
    $("#t-ext").innerHTML = ext ? fmt(ext) + "<small>/mo</small>" : extLines.length ? "<small>To be discussed</small>" : "$0";
    $("#t-subtotal").textContent = fmt(oneOp);
    $("#t-rush").textContent = "+ " + fmt(rush);
    $("#t-coupon").textContent = "- " + fmt(rush);
    $("#t-weeks").textContent = `${weeksTxt} · ${days} days`;
    $("#t-delivery").textContent = `${weeksTxt} · ${days} days`;
    $("#t-count").textContent = state.on.size;
    $("#tab-count").textContent = `${state.on.size} selected`;
    $("#tab-price").textContent = fmt(oneNet);
    $("#t-budget").textContent = `${fmt(oneNet)} USD`;
    $("#mb-onetime").textContent = fmt(oneNet);
    $("#mb-monthly").textContent = (mo + ext) ? `+ ${fmt(mo + ext)}/mo third-party` : extLines.length ? "+ third-party plan TBD" : "";
    if (extLines.length) lines.push(...extLines);
    $("#lines").innerHTML = lines.join("");

    $("#timeline").innerHTML = `<h3>Timeline (${weeksTxt} · ${days} days total)</h3>` + effort.map(([n, d]) => `<div class="ph"><b>${n}</b><i style="width:${(d / days) * 100}%"></i><span>${d} d</span></div>`).join("");

    document.querySelectorAll("#presets button").forEach((b) => b.classList.remove("active"));
  }

  function renderAll() { renderCatalog(); renderPreview(); renderCalc(); save(); }

  /* ---------- events ---------- */
  $("#catalog").addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.toggle) toggle(t.dataset.toggle, t.checked);
    if (t.dataset.qty) { const m = byId[t.dataset.qty]; state.qty[m.id] = Math.min(m.qty.max, Math.max(m.qty.min, +t.value || 0)); }
    if (t.dataset.tier) state.tier[t.dataset.tier] = t.value;
    if (t.dataset.pick && t.value) { const id = t.dataset.pick; state.pick[id] = [...view.picks(id), t.value]; }
    renderAll();
  });
  $("#catalog").addEventListener("click", (e) => {
    const head = e.target.closest(".cat-head");
    if (head) { const id = head.parentElement.dataset.cat; collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id); renderCatalog(); return; }
    if (e.target.closest("[data-arrefs]")) { const b = e.target.closest(".ar-refs"); b.classList.toggle("open"); b.querySelectorAll("video").forEach((v) => b.classList.contains("open") ? v.play().catch(() => {}) : v.pause()); return; }
    if (e.target.dataset.more) { e.target.closest(".mod").classList.toggle("expanded"); return; }
    if (e.target.dataset.unpick) { const id = e.target.dataset.unpick; state.pick[id] = view.picks(id).filter((o) => o !== e.target.dataset.val); renderAll(); return; }
    const mod = e.target.closest(".mod");
    if (mod && !e.target.closest("input,select,label,button") && !byId[mod.dataset.mod].locked) {
      toggle(mod.dataset.mod, !state.on.has(mod.dataset.mod)); renderAll();
    }
  });
  $("#search").addEventListener("input", renderCatalog);
  $("#lines").addEventListener("click", (e) => { if (e.target.dataset.remove) { toggle(e.target.dataset.remove, false); renderAll(); } });
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
  $("#presets").innerHTML = PRESETS.map((p) => `<button data-preset="${p.id}" title="${p.blurb}">${p.id === "worldwide" && !ARTIST.isDefault ? "All-in" : p.name}</button>`).join("");
  $("#presets").addEventListener("click", (e) => { if (e.target.dataset.preset) { applyPreset(e.target.dataset.preset); e.target.classList.add("active"); } });
  $("#btn-reset").addEventListener("click", () => { state.on = new Set(MODULES.filter((m) => m.locked).map((m) => m.id)); state.qty = {}; state.tier = {}; state.pick = {}; renderAll(); });
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
