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
  { id: "ops", name: "Operations & Care", icon: "🛡️", blurb: "Hosting, compliance and ongoing support." },
];

window.CATALOG_VERSION = "2026-09-08.2";
window.MODULES = [
  { id: "hero", cat: "core", locked: true, name: "Hero Landing & Brand System", tagline: "Above-the-fold, Mr. Worldwide style", 
    desc: "Full-screen hero with video/3D loop, tagline, primary CTAs, custom typography and color system. Includes responsive framework, nav and footer.", oneTime: 2000, monthly: 0, ext: 0, extNote: "", days: 21, preview: "hero" },
  { id: "i18n", cat: "core", name: "Languages", tagline: "English + Spanish included - add any other language for $100 each", 
    desc: "The site comes in English and Spanish with a language switcher at the top. Each additional language (French, Italian, German, Dutch...) is +$100: we translate the whole site copy and add it to the switcher.", oneTime: 0, monthly: 0, ext: 0, extNote: "", days: 7, qty: {"label":"Add a language","min":0,"max":12,"unit":100,"unitMonthly":0,"included":["English","Spanish"],"options":["French","Italian","German","Dutch","Portuguese","Japanese","Korean","Mandarin","Arabic","Hindi","Russian","Turkish"]}, preview: "i18n" },
  { id: "capture", cat: "core", name: "Fan Capture (Email + SMS)", tagline: "Own the audience", 
    desc: "Newsletter + SMS opt-in with double opt-in, tagging by interest (tour, AR, merch), connected to Mailchimp / Klaviyo / Community.", oneTime: 350, monthly: 10, ext: 20, extNote: "Mailchimp / Klaviyo plan (grows with list size); SMS via Twilio pay-per-message", days: 7, preview: "capture" },
  { id: "ar_face", cat: "ar", name: "AR Face Tracking Filter", tagline: "Front camera - effects on the fan's face", 
    desc: "Face-tracked AR filter using the front camera: glasses, headwear, makeup, masks and particle FX that follow the fan's face in real time. Includes 3D asset, tracking tuning and QA on iOS/Android. Price per filter.", oneTime: 1550, monthly: 0, ext: 99, extNote: "8th Wall WebAR license (per project)", days: 7, preview: "ar_face" },
  { id: "ar_world", cat: "ar", name: "AR World Filter", tagline: "Back camera - the artist in the fan's space", 
    desc: "World-tracked AR using the back camera: a 3D character, stage or object is placed on the floor or table and fans walk around it, record and share. Includes 3D asset, tracking tuning and QA on iOS/Android. Price per filter.", oneTime: 1550, monthly: 0, ext: 0, extNote: "", days: 7, preview: "ar_world" },
  { id: "presave", cat: "music", name: "Pre-Save Campaign", tagline: "Spotify · Apple Music · Deezer · Amazon", 
    desc: "OAuth pre-save with follow-artist, auto-add to library on release day, fan data capture, thank-you page with exclusive filter unlock.", oneTime: 500, monthly: 10, ext: 20, extNote: "Pre-save platform (feature.fm) - $0 if we use own OAuth", days: 11, preview: "presave" },
  { id: "countdown", cat: "music", name: "Release Countdown & Reveal", tagline: "Tension until midnight", 
    desc: "Timezone-aware countdown, scheduled reveal of cover art/tracklist, confetti moment, auto-switch to smart links on release.", oneTime: 100, monthly: 0, ext: 0, extNote: "", days: 4, preview: "countdown" },
  { id: "calendar", cat: "tour", name: "Tour Calendar", tagline: "Dates synced from Bandsintown / Songkick", 
    desc: "Interactive calendar + map view, auto-import, ticket links, 'notify me when he's near me' alerts, add-to-calendar (ICS/Google).", oneTime: 350, monthly: 5, ext: 0, extNote: "", days: 11, preview: "calendar" },
  { id: "worldmap", cat: "social", name: "Worldwide Fan Map", tagline: "A pin on the map for every fan who uses the filters", 
    desc: "Live world map: every time a fan uses one of the AR filters, they are asked for permission and a pin is dropped on the map at their location. Per-country and per-city counters, real-time heat while the campaign runs.", oneTime: 150, monthly: 10, ext: 0, extNote: "Mapbox free tier up to 50k loads/month", days: 14, preview: "worldmap" },
  { id: "analytics", cat: "growth", name: "Analytics & Fan Dashboard (Google Analytics)", tagline: "GA4 with 10 tracked events + your own segmented dashboard", 
    desc: "Google Analytics 4 wired into the whole site with 10 tracked events included (page views, AR filter opens, pre-saves, ticket clicks, sign-ups, merch clicks, shares, video plays, language, country). Includes a private dashboard page where your team sees all metrics segmented by country, device, campaign and fan tier. Each extra event to track is +$50.", oneTime: 500, monthly: 15, ext: 0, extNote: "", days: 3, qty: {"label":"Extra events to track","min":0,"max":30,"unit":50,"unitMonthly":0}, preview: "analytics" },
  { id: "seo", cat: "growth", name: "SEO & Performance Pass", tagline: "Core Web Vitals green", 
    desc: "Technical SEO, structured data, image/CDN optimisation, Lighthouse ≥ 90.", oneTime: 100, monthly: 0, ext: 0, extNote: "", days: 1, preview: null },
  { id: "hosting", cat: "ops", locked: true, name: "Hosting, CDN & Security", tagline: "Vercel/Cloudflare, global edge", 
    desc: "Edge hosting, DDoS protection, SSL, daily backups, monitoring. Scales for drop-night traffic spikes.", oneTime: 250, monthly: 25, ext: 20, extNote: "Vercel Pro / Cloudflare plan", days: 4, preview: null },
  { id: "a11y", cat: "ops", name: "Accessibility (WCAG 2.2 AA)", tagline: "Everyone gets in", 
    desc: "Audit + remediation, captions, reduced-motion modes, AR alternatives.", oneTime: 100, monthly: 0, ext: 0, extNote: "", days: 7, preview: null },
  { id: "support", cat: "ops", name: "Maintenance & Support Retainer", tagline: "Updates, monitoring, small changes", 
    desc: "Monthly hours for content help, dependency updates and new filter QA.", oneTime: 0, monthly: 0, ext: 0, extNote: "", days: 0, tier: { label: "Retainer level", options: [
      {"id":"basic","name":"Basic — 4 h/mo","oneTime":0,"monthly":150},
      {"id":"pro","name":"Pro — 10 h/mo, 24h SLA","oneTime":0,"monthly":350},
      {"id":"tour","name":"Tour mode — on-call during shows","oneTime":0,"monthly":700} ] }, preview: null },
];

/* Pre-built bundles the client can start from */
window.PRESETS = [
  { id: "starter", name: "Starter", blurb: "≈ $5k — landing + AR filters + pre-save + calendar.",
    modules: ["hero", "hosting", "capture", "ar_face", "presave", "calendar"] },
  { id: "fan", name: "Fan Experience", blurb: "≈ $8k — adds more filters, fan club, rewards, store.",
    modules: ["hero", "hosting", "i18n", "capture", "ar_face", "presave", "countdown", "calendar", "support"] },
  { id: "worldwide", name: "Mr. Worldwide", blurb: "≈ $15k — everything: livestream, collectibles, fan map, full retainer.",
    modules: "all" },
];

/* Budget bands the proposal is aimed at (one-time build) */
window.BUDGETS = [
  { id: "base", name: "Base", max: 5000 },
  { id: "mid", name: "Mid", max: 8000 },
  { id: "top", name: "Top", max: 15000 },
];
