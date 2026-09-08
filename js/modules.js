/*
 * Module catalog for the Mr. Worldwide fan-experience site.
 * Each module: id, category, name, tagline, description, oneTime (USD), monthly (USD),
 * weeks (build effort), tier (optional variants), qty (optional per-unit pricing),
 * requires (module ids), preview (how it renders in the landing mock).
 */
window.CATEGORIES = [
  { id: "core", name: "Core & Brand", icon: "🌍", blurb: "The foundation every configuration ships with." },
  { id: "ar", name: "WebAR Filters", icon: "🕶️", blurb: "Browser-based AR — no app download. Powered by 8th Wall / WebXR." },
  { id: "music", name: "Music & Releases", icon: "🎧", blurb: "Pre-saves, smart links and release moments." },
  { id: "tour", name: "Tour & Calendar", icon: "📅", blurb: "Dates, tickets and live moments." },  { id: "social", name: "Social & Community", icon: "📣", blurb: "UGC, challenges and shareable fan moments." },
  { id: "growth", name: "Data & Growth", icon: "📈", blurb: "Analytics, CRM and marketing plumbing." },
  { id: "ops", name: "Operations & Care", icon: "🛡️", blurb: "Hosting, security and compliance." },
];

window.CATALOG_VERSION = "2026-09-08.26";
window.MODULES = [
  { id: "hero", cat: "core", locked: true, name: "Hero Landing & Brand System", tagline: "Above-the-fold, Mr. Worldwide style", 
    desc: "Full-screen hero with video/3D loop, tagline, primary CTAs, custom typography and color system. Includes responsive framework, nav and footer.", oneTime: 1500, monthly: 0, ext: 0, extNote: "", days: 4, preview: "hero" },
  { id: "i18n", cat: "core", name: "Languages", tagline: "English + Spanish included - add any other language for $63 each", 
    desc: "The site comes in English and Spanish with a language switcher at the top. Each additional language (French, Italian, German, Dutch...) is +$63: we translate the whole site copy and add it to the switcher.", oneTime: 0, monthly: 0, ext: 0, extNote: "", days: 1, qty: {"label":"Add a language","min":0,"max":12,"unit":50,"unitMonthly":0,"included":["English","Spanish"],"options":["French","Italian","German","Dutch","Portuguese","Japanese","Korean","Mandarin","Arabic","Hindi","Russian","Turkish"]}, preview: "i18n" },
  { id: "capture", cat: "core", name: "Fan Capture (Newsletter)", tagline: "Capture fan emails and grow your list", 
    desc: "Email capture form to build the artist's newsletter list: double opt-in, tagging by interest (tour, AR, merch), connected to Mailchimp / Klaviyo so the team sends campaigns from there - we never store emails ourselves. If fans in the European Union will sign up, the site also needs a 'delete my data' request form to be compliant with GDPR (data protection law) - pick the 'US / LatAm + Europe' option (+$188).", oneTime: 200, monthly: 0, ext: 0, extNote: "Mailchimp / Klaviyo plan - the client picks and pays the plan", days: 2, tier: { label: "Regions", options: [
      {"id":"standard","name":"US / LatAm - email capture","oneTime":0,"monthly":0},
      {"id":"eu","name":"+ Europe (GDPR) - adds delete-my-data form","oneTime":150,"monthly":0} ] }, preview: "capture" },
  { id: "ar_face", cat: "ar", name: "AR Face Tracking Filter", tagline: "Front camera - effects on the fan's face", 
    desc: "Face-tracked AR filter using the front camera: glasses, headwear, makeup, masks and particle FX that follow the fan's face in real time. Includes 3D asset, tracking tuning and testing on iOS/Android. Price per filter.", oneTime: 1550, monthly: 0, ext: 0, extNote: "", days: 7, preview: "ar_face" },
  { id: "ar_world", cat: "ar", name: "AR World Filter", tagline: "Back camera - the artist in the fan's space", 
    desc: "World-tracked AR using the back camera: a 3D character, stage or object is placed on the floor or table and fans walk around it, record and share. Includes 3D asset, tracking tuning and testing on iOS/Android. Price per filter.", oneTime: 1550, monthly: 0, ext: 0, extNote: "", days: 7, preview: "ar_world" },
  { id: "presave", cat: "music", name: "Pre-Save Campaign", tagline: "Spotify · Apple Music · Deezer · Amazon", 
    desc: "OAuth pre-save with follow-artist, auto-add to library on release day, fan data capture, thank-you page with exclusive filter unlock.", oneTime: 200, monthly: 0, ext: 0, extNote: "", days: 2, preview: "presave" },
  { id: "countdown", cat: "music", name: "Release Countdown & Reveal", tagline: "Tension until midnight", 
    desc: "Timezone-aware countdown, scheduled reveal of cover art/tracklist, confetti moment, auto-switch to smart links on release.", oneTime: 100, monthly: 0, ext: 0, extNote: "", days: 0.5, preview: "countdown" },
  { id: "calendar", cat: "tour", name: "Tour Calendar", tagline: "Dates synced from Bandsintown / Songkick", 
    desc: "Interactive calendar + map view, auto-import, ticket links, 'notify me when he's near me' alerts, add-to-calendar (ICS/Google).", oneTime: 150, monthly: 0, ext: 0, extNote: "", days: 1, preview: "calendar" },
  { id: "worldmap", cat: "social", name: "Worldwide Fan Map", tagline: "A pin on the map for every fan who uses the filters", 
    desc: "Live world map: every time a fan uses one of the AR filters, they are asked for permission and a pin is dropped on the map at their location. Per-country and per-city counters, real-time heat while the campaign runs.", oneTime: 150, monthly: 0, ext: 0, extNote: "", days: 1, preview: "worldmap" },
  { id: "sponsors", cat: "social", name: "Sponsors Wall", tagline: "Auto-scrolling logo strip of the event sponsors", 
    desc: "Sponsors section at the bottom of the site: an auto-scrolling strip with the logos of the event/tour sponsors, each linking to the sponsor's site. Logos are managed by your team (add, remove, reorder). Sponsor metrics are included: with the Analytics & Fan Dashboard module, every logo reports impressions and clicks so each sponsor gets a report of how many fans saw their brand.", oneTime: 150, monthly: 0, ext: 0, extNote: "", days: 3, preview: "sponsors" },
  { id: "analytics", cat: "growth", name: "Analytics & Fan Dashboard (Google Analytics)", tagline: "GA4 with 10 tracked events + a private metrics dashboard page (not shown on the public site)", 
    desc: "Google Analytics 4 wired into the whole site with 10 tracked events included (page views, AR filter opens, pre-saves, ticket clicks, sign-ups, merch clicks, shares, video plays, language, country). Includes a private dashboard page where your team sees all metrics segmented by country, device, campaign and fan tier. Each extra event to track is +$50.", oneTime: 500, monthly: 0, ext: 0, extNote: "", days: 2, qty: {"label":"Extra events to track","min":0,"max":30,"unit":50,"unitMonthly":0}, preview: "analytics" },
  { id: "seo", cat: "growth", name: "SEO & Performance Pass", tagline: "Core Web Vitals green", 
    desc: "Technical SEO, structured data, image/CDN optimisation, Lighthouse ≥ 90.", oneTime: 200, monthly: 0, ext: 0, extNote: "", days: 1, preview: null },
  { id: "hosting", cat: "ops", locked: true, name: "Hosting, CDN & Security", tagline: "Static-page hosting included - domain not included", 
    desc: "Hosting is included in the budget: the site is deployed as a static page (Vercel/Cloudflare) with SSL, global CDN and DDoS protection. The custom domain (www.yourdomain.com) is not included in this budget: it is an extra paid and owned by the client (~$10-20/year at a registrar); we connect it to the site.", oneTime: 400, monthly: 0, ext: 0, extNote: "", days: 4, preview: null },
  { id: "a11y", cat: "ops", name: "Accessibility (WCAG 2.2 AA)", tagline: "Everyone gets in", 
    desc: "Audit + remediation, captions, reduced-motion modes.", oneTime: 150, monthly: 0, ext: 0, extNote: "", days: 1, preview: null },
  { id: "maint", cat: "ops", name: "Maintenance (4 months)", tagline: "One payment covers 4 months of updates", 
    desc: "Optional. Paid once, covers 4 months: whenever you need to update photos, logos, texts, tour dates or upload a new video, send it to us and we handle it.", oneTime: 200, monthly: 0, ext: 0, extNote: "", days: 0, preview: null },
];

/* Pre-built bundles the client can start from */
window.PRESETS = [
  { id: "starter", name: "Starter", blurb: "Landing + 1 AR filter + pre-save + calendar + newsletter.",
    modules: ["hero", "hosting", "capture", "ar_face", "presave", "calendar"] },
  { id: "fan", name: "Fan Experience", blurb: "2 AR filters + countdown, fan map, analytics, SEO.",
    modules: ["hero", "hosting", "i18n", "capture", "ar_face", "ar_world", "presave", "countdown", "calendar", "worldmap", "analytics", "seo"] },
  { id: "worldwide", name: "Mr. Worldwide", blurb: "Everything, top tiers, 2 AR filters + 4 extra languages.",
    modules: "all" },
];

/* Budget bands the proposal is aimed at (one-time build) */
window.BUDGETS = [
  { id: "base", name: "Base", max: 5000 },
  { id: "mid", name: "Mid", max: 8000 },
  { id: "top", name: "Top", max: 15000 },
];
