/* Renders each selected module as a section of the fan-experience landing. */
(function () {
  const sec = (id, title, sub, body, cls = "") =>
    `<section data-mod="${id}" class="${cls}"><span class="tag">${title}</span>${sub}${body}</section>`;
  const h = (t) => `<h2 class="sec-title">${t}</h2>`;
  const p = (t) => `<p class="sub">${t}</p>`;
  const cards = (items, cls = "") => `<div class="grid">${items.map(([b, s]) => `<div class="card ${cls}"><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;

  const A = () => window.ARTIST || { name: "Pitbull", upper: "PITBULL", alias: "Mr. Worldwide", isDefault: true };
  const heroTitle = () => {
    const a = A();
    if (a.isDefault) return "MR.<br><span>WORLDWIDE</span>";
    const w = a.upper.split(" ");
    return w.length > 1 ? `${w[0]}<br><span>${w.slice(1).join(" ")}</span>` : `<span>${a.upper}</span>`;
  };

  const d = (pit, gen) => (A().isDefault ? pit : gen);
  const R = {};

  const FLAG = { English: "us", Spanish: "es", French: "fr", Italian: "it", German: "de", Dutch: "nl", Portuguese: "br", Japanese: "jp", Korean: "kr", Mandarin: "cn", Arabic: "sa", Hindi: "in", Russian: "ru", Turkish: "tr" };
  const CODE = { English: "EN", Spanish: "ES", French: "FR", Italian: "IT", German: "DE", Dutch: "NL", Portuguese: "PT", Japanese: "JA", Korean: "KO", Mandarin: "ZH", Arabic: "AR", Hindi: "HI", Russian: "RU", Turkish: "TR" };
  R.hero = (s) => `
    <div class="p-nav"><b>${A().upper}</b><span>Music</span><span>AR Filters</span><span>Tour</span><span>Fan Club</span><span>Store</span></div>
    <section data-mod="hero" class="hero">
      ${s.has("i18n") ? `<div class="lang">${["English", "Spanish", ...(s.picks ? s.picks("i18n") : [])].map((l, i) => `<span class="${i ? "" : "on"}" title="${l}">${FLAG[l] ? `<img src="https://flagcdn.com/w20/${FLAG[l]}.png" alt="" />` : "🌐"} ${CODE[l] || l.slice(0, 2).toUpperCase()}</span>`).join("")}</div>` : ""}
      <h1>${heroTitle()}</h1>
      <p>The official ${A().name} fan experience. Unlock AR filters, pre-save the new album, catch the tour and earn your place on the worldwide leaderboard.${A().isDefault ? " Dale!" : ""}</p>
      <div class="ctas">
        ${s.has("ar_hub") ? `<span class="pill y">Try the AR filters</span>` : ""}
        ${s.has("presave") ? `<span class="pill p">Pre-save the album</span>` : ""}
        ${s.has("calendar") ? `<span class="pill o">Tour dates</span>` : ""}
        ${!s.has("ar_hub") && !s.has("presave") && !s.has("calendar") ? `<span class="pill o">Enter</span>` : ""}
      </div>
    </section>`;

  R.countdown = () => sec("countdown", "Release countdown", h("NEW ALBUM DROPS IN") + p("Timezone-aware. Cover art reveals at midnight local."),
    `<div class="count"><div><b>12</b><span>days</span></div><div><b>08</b><span>hours</span></div><div><b>45</b><span>min</span></div><div><b>09</b><span>sec</span></div></div>`);

  R.presave = () => sec("presave", "Pre-save", h("PRE-SAVE & UNLOCK") + p("Save it on your platform — get an exclusive AR filter the second you do."),
    `<div class="chips"><span class="pill c">Spotify</span><span class="pill o">Apple Music</span><span class="pill o">Deezer</span><span class="pill o">Amazon Music</span></div>`);

  R.ar_hub = (s) => {
    const refs = MODULES.filter((m) => m.cat === "ar" && s.has(m.id) && window.AR_MEDIA && AR_MEDIA[m.id]).map((m) => {
      const ar = AR_MEDIA[m.id];
      const vids = ar.videos.map((v) => `<figure><video src="${v.src}" muted loop playsinline autoplay preload="metadata"></video><figcaption>${v.effect}</figcaption></figure>`).join("");
      return `<div class="ar-ref"><div class="ar-ref-vids">${vids || '<div class="ar-ref-empty">Image target demo</div>'}</div><h3>${m.name} <span class="pill">${ar.camera}</span></h3><p class="sub">${ar.what}</p></div>`;
    }).join("");
    return sec("ar_hub", "WebAR hub", h("AR FILTERS - NO APP NEEDED") + p("Point your phone at the QR or tap on mobile. Works on iOS & Android in the browser."), refs);
  };

  R.ar_ugc = () => sec("ar_ugc", "UGC wall", h("FAN MOMENTS") + p("Moderated captures from fans worldwide — the best make it to the venue screens."),
    `<div class="feed">${["Miami", "Madrid", "São Paulo", "Tokyo", "Mexico City", "Lagos"].map((c) => `<div data-net="${c}"></div>`).join("")}</div>`);

  R.calendar = (s) => {
    const dates = [["12", "SEP", "Miami, FL", "Kaseya Center"], ["19", "SEP", "Los Angeles, CA", "Crypto.com Arena"], ["03", "OCT", "Madrid, ES", "WiZink Center"], ["11", "OCT", "Mexico City, MX", "Foro Sol"]];
    return sec("calendar", "Tour calendar", h(d("WORLDWIDE TOUR", "ON TOUR")) + p("Synced from Bandsintown. Add to your calendar. Get alerts when he's near you."),
      `<div class="dates">${dates.map(([d, m, c, v], i) => `<div class="date"><div class="d">${d}<small>${m}</small></div><div class="c">${c}<span>${v}</span></div><div>${s.has("tickets") && i === 0 ? `<span class="pill p" style="padding:6px 12px;font-size:11px">Presale code</span>` : `<span class="pill o" style="padding:6px 12px;font-size:11px">Tickets</span>`}${s.has("vip") ? ` <span class="pill y" style="padding:6px 12px;font-size:11px">VIP</span>` : ""}</div></div>`).join("")}</div>`);
  };

  R.setlist = () => sec("setlist", "Setlist voting", h("YOU PICK ONE SONG — MIAMI") + p("Voting closes at doors."),
    `<div class="poll">${[["Give Me Everything", 62], ["Timber", 48], ["Fireball", 41], ["I Know You Want Me", 33]].map(([t, v]) => `<div><span>${t}</span><div class="bar"><i style="width:${v}%"></i></div><span>${v}%</span></div>`).join("")}</div>`);

  R.livestream = () => sec("livestream", "Livestream", h("LIVE FROM MIAMI — SEP 12") + p("Watch party with live chat and reactions. Replay for 48h."),
    `<div class="card" style="aspect-ratio:16/9;max-width:560px;background:linear-gradient(135deg,#2a1a30,#101018)"><b>▶ Stream starts in 2h 14m</b><span>PPV $9.99 · Free for ${d("Worldwide", "VIP")} members</span></div>`);

  R.fanclub = () => sec("fanclub", "Fan club", h("JOIN THE FAMILIA") + p("One login. Three tiers. Perks that grow with you."),
    `<div class="tiers"><div class="tier"><b>Free</b><span class="price">$0</span><br>Newsletter, AR hub, leaderboard</div><div class="tier hi"><b>${d("Dale", "Fan")}</b><span class="price">$5<small>/mo</small></span><br>Presales, filter early access, badge</div><div class="tier"><b>${d("Worldwide", "VIP")}</b><span class="price">$15<small>/mo</small></span><br>Livestreams, drops early access, VIP lottery</div></div>`);

  R.points = (s) => sec("points", "Rewards", h("EARN POINTS. UNLOCK DALE.") + p("Stream, share, capture, attend — every action counts."),
    `<div class="row"><div class="chips"><span class="chip">+50 pre-save</span><span class="chip">+20 AR capture</span><span class="chip">+100 attend show</span><span class="chip">+10 share</span></div></div>
     <div style="margin-top:14px;max-width:420px"><div class="row" style="justify-content:space-between;font-size:12px"><span>Level 4 · Fireball</span><span>2,340 / 3,000</span></div><div class="bar"><i style="width:78%"></i></div></div>
     ${s.has("leaderboard") ? `<div class="lb" style="margin-top:14px;max-width:420px"><div><span>#1</span><span>🇲🇽 @${d("dale_carlos", "carlos_fan")}</span><span>18,920</span></div><div><span>#2</span><span>🇪🇸 @${d("mariaworldwide", "maria_vip")}</span><span>17,400</span></div><div><span>#3</span><span>🇺🇸 @${d("miami305", "nyc_fan")}</span><span>16,110</span></div></div>` : ""}`);

  R.leaderboard = (s) => (s.has("points") ? "" : sec("leaderboard", "Leaderboard", h(d("WORLDWIDE LEADERBOARD", "FAN LEADERBOARD")), `<div class="lb"><div><span>#1</span><span>🇲🇽 @${d("dale_carlos", "carlos_fan")}</span><span>18,920</span></div><div><span>#2</span><span>🇪🇸 @${d("mariaworldwide", "maria_vip")}</span><span>17,400</span></div></div>`));

  R.quiz = () => sec("quiz", "Quiz", h(d("HOW WORLDWIDE ARE YOU?", "WHAT KIND OF FAN ARE YOU?")) + p("6 questions. One filter unlocked. Infinite bragging rights."),
    `<div class="chips"><span class="pill y">Start quiz</span><span class="chip">Results: ${d("Mr. 305 · Mr. Worldwide · Dale Legend", "Casual · Superfan · Legend")}</span></div>`);

  R.fancard = () => sec("fancard", "Fan card", h(d("YOUR WORLDWIDE PASSPORT", "YOUR FAN PASSPORT")) + p("Connect Spotify to generate your personal stats card."),
    `<div class="passport"><div><span>Minutes streamed</span><b>14,230</b></div><div><span>Top track</span><b>Fireball</b></div><div><span>Shows attended</span><b>3</b></div><div><span>Fan since</span><b>2009</b></div></div>`);

  R.contests = () => sec("contests", "Giveaway", h("WIN A FLIGHT TO THE MIAMI SHOW") + p("Enter by pre-saving, sharing an AR capture or joining the fan club."),
    `<div class="chips"><span class="pill p">Enter now</span><span class="chip">Ends Sep 10 · Official rules</span></div>`);

  R.birthday = () => sec("birthday", "Personal video", h(`A MESSAGE FROM ${A().alias.toUpperCase()}`) + p("Members can request a personalised birthday shout-out."),
    `<div class="card" style="max-width:360px;aspect-ratio:16/9;background:linear-gradient(135deg,#302a10,#101018)"><b>🎂 "Happy birthday, Sofia${d(" — Dale!", "!")}"</b><span>Rendered from approved templates</span></div>`);

  R.fanwall = () => sec("fanwall", "Fan wall", h("THE WALL") + p("Moderated community feed."),
    `<div class="lb"><div><span>💬</span><span><b>@${d("lucia_305", "lucia_fan")}</b> — Just unlocked the Madrid filter!! 🔥</span><span>2m</span></div><div><span>📌</span><span><b>${A().name}</b> — Miami, you ready? See you Friday.</span><span>1h</span></div></div>`);

  R.store = (s) => sec("store", "Store", h("OFFICIAL MERCH") + p("Shopify-powered. Ships worldwide."),
    cards([[d("Worldwide Cap", "Logo Cap"), "$35"], [d("Dale Tee", "Tour Tee"), "$40"], [d("305 Hoodie", "Hoodie"), "$85"], ["Tour Poster", "$25"]], "thumb") +
    (s.has("drops") ? `<div class="chips" style="margin-top:14px"><span class="chip hot">🔥 Limited drop · Fri 12PM ET · Members 1h early</span><span class="chip">Virtual queue · 2 per fan</span></div>` : "") +
    (s.has("bundles") ? `<div class="chips" style="margin-top:8px"><span class="chip">Album + Hoodie bundle · $99</span><span class="chip">Vinyl pre-order</span></div>` : ""));

  R.collectibles = () => sec("collectibles", "Collectibles", h("PASSPORT STAMPS") + p("Collect a stamp for every show, release and filter. Optional on-chain scarcity."),
    `<div class="grid">${["Miami '26", "Madrid '26", "Album Day", "First Filter", "?"].map((t) => `<div class="card" style="aspect-ratio:1;align-items:center;justify-content:center;text-align:center"><b>${t}</b></div>`).join("")}</div>`);

  R.donate = () => sec("donate", "Causes", h("SLAM! FOUNDATION") + p("Every ticket helps build schools. Round up your merch order."),
    `<div class="row"><div class="bar" style="flex:1;max-width:400px"><i style="width:64%"></i></div><span style="font-size:12px">$640k / $1M</span><span class="pill o" style="font-size:11px;padding:6px 12px">Donate</span></div>`);

  R.smartlinks = () => sec("smartlinks", "Discography", h("DISCOGRAPHY") + p("Every release, every platform — auto-synced."),
    cards([["Trackhouse", "2023"], ["Libertad 548", "2019"], ["Climate Change", "2017"], ["Globalization", "2014"]], "thumb"));

  R.player = () => sec("player", "Mini player", `<div class="player"><div class="disc"></div><div><b style="font-size:13px">Give Me Everything</b><br><span>Pitbull · Planet Pit</span></div><div class="bar"><i style="width:40%"></i></div><span>▶</span></div>`, "");

  R.playlist = () => sec("playlist", "Fan playlist", h("THE PRE-SHOW PLAYLIST — YOU BUILD IT") + p("Vote weekly. Winners go live on Spotify."),
    `<div class="poll"><div><span>Hotel Room Service</span><div class="bar"><i style="width:80%"></i></div><span>1.2k</span></div><div><span>Don't Stop the Party</span><div class="bar"><i style="width:55%"></i></div><span>830</span></div></div>`);

  R.video = () => sec("video", "Video hub", h("WATCH") + p("Music videos, behind the scenes, interviews."), cards([["Official video", "4:12"], ["Behind the tour", "12:30"], ["Studio session", "6:05"]], "thumb"));
  R.gallery = () => sec("gallery", "Gallery", h("PHOTOS"), `<div class="feed">${Array.from({ length: 6 }).map((_, i) => `<div data-net="${["Miami", "LA", "Madrid", "Studio", "Red carpet", "Tour"][i]}"></div>`).join("")}</div>`);
  R.analytics = (s) => sec("analytics", "Team dashboard (private)", h("YOUR FAN METRICS") + p(`Google Analytics 4 - ${10 + s.qty("analytics")} events tracked. Private panel for your team, segmented by country, device, campaign and fan tier.`),
    `<div class="grid"><div class="card"><b>128k</b><span>Visitors / 30d</span></div><div class="card"><b>41k</b><span>AR filter opens</span></div><div class="card"><b>9.2k</b><span>Pre-saves</span></div><div class="card"><b>3.1k</b><span>Ticket clicks</span></div></div>
     <div class="lb"><div><span>US</span><span>Miami - LA - NYC</span><span>38%</span></div><div><span>MX</span><span>CDMX - GDL</span><span>17%</span></div><div><span>ES</span><span>Madrid - BCN</span><span>11%</span></div></div>`);
  R.news = () => sec("news", "News", h("LATEST") , cards([["New album announced", "Sep 1"], ["World tour adds 12 dates", "Aug 20"], ["AR filters now live", "Aug 2"]]));
  R.timeline = () => sec("timeline", "Timeline", h("MIAMI → WORLDWIDE") + p("Scroll-driven career story."),
    `<div class="chips"><span class="chip">2004 · M.I.A.M.I.</span><span class="chip">2009 · I Know You Want Me</span><span class="chip">2011 · Give Me Everything</span><span class="chip">2013 · Timber</span><span class="chip">2026 · New era</span></div>`);

  R.socialfeed = () => sec("socialfeed", "Social feed", h("#DALEWORLDWIDE"), `<div class="feed">${["TikTok", "Instagram", "X", "YouTube", "TikTok", "Instagram"].map((n) => `<div data-net="${n}"></div>`).join("")}</div>`);
  R.challenge = () => sec("challenge", "Challenge", h("THE DALE CHALLENGE") + p("Use the sound + the AR filter. Top videos win backstage passes."),
    `<div class="chips"><span class="pill p">Join on TikTok</span><span class="chip">48.2M views</span><span class="chip">Featured: @juanito_dance</span></div>`);
  R.worldmap = () => sec("worldmap", "Fan map", h("FANS CHECKING IN RIGHT NOW") + p("A pin on the globe for every fan who opens a filter (with their permission)."),
    `<div class="globe3d"><div class="globe-stats"><span><b>12,480</b> fans on the map</span><span><b>64</b> countries</span><span><b>+318</b> in the last hour</span></div></div>`);

  R.sponsors = (s) => {
    const logos = ["Voli 305", "Bud Light", "Pepsi", "Norwegian", "Sprint", "Kodak", "Boost", "Fireball"];
    const strip = logos.concat(logos).map((n) => `<span>${n}</span>`).join("");
    const metrics = s.tier("sponsors") === "metrics";
    return sec("sponsors", "Sponsors", h("OFFICIAL PARTNERS") + p(metrics ? "Each logo reports impressions & clicks to Analytics - every sponsor gets its own reach report." : "Auto-scrolling strip with the event sponsors."),
      `<div class="marquee"><div>${strip}</div></div>` + (metrics ? `<div class="chips"><span class="chip">Voli 305 - 84k impressions - 2.1k clicks</span><span class="chip">Pepsi - 79k impressions - 1.4k clicks</span></div>` : ""));
  };

  R.capture = () => sec("capture", "Fan capture", h("STAY IN THE LOOP") + p("Tour alerts, filter drops and presale codes. EN / ES."),
    `<div class="form"><input placeholder="Email or phone" /><span class="pill y">Join</span></div>`);

  R.footer = (s) => `<div class="footer"><span>© ${A().name}${d(" · Mr. 305 Inc.", "")}</span><span>${s.has("legal") ? "Privacy · Cookies · Age 13+ for AR" : "Privacy"}${s.has("press") ? " · Press kit" : ""}${s.has("a11y") ? " · Accessibility" : ""}${s.has("pwa") ? " · 📲 Install app" : ""}</span></div>`;

  /* Order in which sections appear on the landing */
  window.PREVIEW_ORDER = ["hero", "countdown", "presave", "ar_hub", "ar_ugc", "calendar", "setlist", "livestream", "fanclub", "points", "leaderboard", "quiz", "fancard", "contests", "birthday", "fanwall", "store", "collectibles", "donate", "smartlinks", "playlist", "video", "gallery", "news", "timeline", "challenge", "socialfeed", "worldmap", "capture", "player", "sponsors"];
  window.PREVIEW_RENDERERS = R;
})();
