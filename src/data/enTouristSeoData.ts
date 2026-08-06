// English-language tourist SEO pages — isolated pilot, fully separate from the
// Portuguese programmatic SEO (own route namespace /en/*, own sitemap, no
// hreflang links to PT pages, no shared PT-hardcoded components).
//
// Audience: ALL international tourists staying in short-term rentals in
// Portugal, regardless of nationality (American, British, French, Spanish,
// Italian, Chinese, etc.) — English is used as the shared language, not as
// a UK-specific play. Copy is written nationality-neutral on purpose: no
// country-specific references, currencies, or cultural assumptions.
//
// Regional weighting is based on seasonality and rental density, not on any
// single source market: Lisboa and Porto run short-term-rental demand
// year-round, with millions of visitors a year and thousands of Alojamento
// Local listings spread across each city and its surrounding municípios,
// while the Algarve is heavily concentrated in the summer season. Page
// count reflects that: Porto area 9 (city + 7 surrounding municípios + host
// page), Lisboa area 9 (city + 7 surrounding municípios + host page),
// Algarve 5 (4 resort towns + host page) — Porto and Lisboa deliberately
// lead, not the Algarve.
//
// Two audiences, two page types:
// - "guest": tourists staying in a holiday rental who need urgent help with
//   a stain/spill/accident (price-insensitive, urgency-driven).
// - "host": Airbnb/holiday-let hosts who need fast turnover cleaning between
//   guests and photographic proof for damage/deposit claims — a real,
//   underserved angle (Airbnb's own Aircover process requires "verifiable
//   evidence" of damage, which this business already produces as standard
//   before/after documentation).

export type EnPageAudience = "guest" | "host";

export interface EnScenario {
  title: string;
  body: string;
}

export interface EnPageData {
  slug: string;
  audience: EnPageAudience;
  citySlug: string; // matches src/data/locationSeoData.ts city slugs, for price/travel lookups
  region: "Algarve" | "Lisbon Area" | "Porto Area";
  title: string;
  metaDescription: string;
  h1: string;
  h1Gold: string;
  intro: string;
  scenarios: EnScenario[];
  whyUs: string[];
  faqs: { question: string; answer: string }[];
}

export const EN_PAGES: EnPageData[] = [
  // ─── Algarve — guest/tourist pages (4) ────────────────────────────────
  {
    slug: "emergency-stain-removal-albufeira",
    audience: "guest",
    citySlug: "albufeira",
    region: "Algarve",
    title: "Emergency Stain Removal in Albufeira | Same-Day Service | Kyro Clean",
    metaDescription: "Wine, food or make-up stain on the sofa or mattress in your Albufeira holiday rental? We come out the same day. English-speaking team, professional equipment.",
    h1: "Spilled something in your Albufeira",
    h1Gold: "holiday rental?",
    intro: "It happens to almost every guest at some point: a glass of wine on the sofa, sun cream on the mattress, sand and salt ground into a rug. We're a professional upholstery cleaning team based in the Algarve, and we can usually be at your accommodation the same day you call.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "The single most common accident in holiday apartments. Fresh spills respond very well to professional steam extraction, even hours later." },
      { title: "Sun cream, fake tan or make-up stains", body: "Common in Algarve rentals during summer. These oily stains need a specific pre-treatment before extraction, not just water." },
      { title: "Sand, salt and general beach-day grime", body: "Rugs and sofas near the beach take a beating. A deep clean restores them without damaging the fibres." },
      { title: "Mattress stains", body: "Whatever happened, we treat it discreetly and professionally, with hospital-grade sanitising as standard." },
    ],
    whyUs: [
      "English-speaking technicians — no language barrier when you're already stressed",
      "Same-day appointments available across Albufeira and the surrounding area",
      "Professional hot-water extraction equipment, not a rented carpet cleaner",
      "5.0★ rating on Google from over 60 verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes, subject to availability — message us on WhatsApp with a photo of the stain and we'll confirm a time the same day." },
      { question: "Do I need to be there?", answer: "It helps if someone can let the technician in, but we can also coordinate directly with your host or property manager if you're out for the day." },
      { question: "Will it be dry before I check out?", answer: "Most sofas and rugs are usable again within 2-4 hours thanks to our extraction method, which removes far more moisture than a standard clean." },
    ],
  },
  {
    slug: "emergency-stain-removal-lagos",
    audience: "guest",
    citySlug: "lagos",
    region: "Algarve",
    title: "Emergency Stain Removal in Lagos | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Lagos holiday rental? Professional same-day cleaning, English-speaking team, no need to worry about the deposit.",
    h1: "Accident in your Lagos",
    h1Gold: "holiday rental?",
    intro: "A spilled drink, a sandy rug, a stained mattress — none of it needs to ruin your holiday or put your deposit at risk. We're a professional upholstery cleaning team covering Lagos and the western Algarve, usually available the same day.",
    scenarios: [
      { title: "Red wine or coffee on the sofa", body: "Acts fast on organic stains before they set permanently into the fibres — the sooner we're called, the better the result." },
      { title: "Salt, sand and sun cream residue", body: "Very common after a day at Praia Dona Ana or Meia Praia. We clean rugs and upholstery without over-wetting or damaging delicate fabrics." },
      { title: "Mattress accidents", body: "Treated discreetly with hospital-grade disinfectant, whatever the cause." },
      { title: "General end-of-stay refresh", body: "If you'd simply like the place to look its best before check-out, we can do a quick professional pass on the main pieces." },
    ],
    whyUs: [
      "English-speaking team — explain the problem once, clearly",
      "Same-day availability in Lagos and nearby areas",
      "Professional hot-water extraction, not a supermarket carpet shampoo",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming, depending on our schedule that day — message us with your location and the sooner the better." },
      { question: "Do you work with holiday rental hosts directly?", answer: "Yes, we regularly coordinate directly with hosts and property managers, not just guests." },
      { question: "Is it expensive?", answer: "Pricing depends on the item and size, and we always confirm the price before starting — no surprises at the end." },
    ],
  },
  {
    slug: "emergency-stain-removal-portimao",
    audience: "guest",
    citySlug: "portimao",
    region: "Algarve",
    title: "Emergency Stain Removal in Portimão | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, mattress or rug in your Portimão holiday rental? We come out the same day. English-speaking, professional, no fuss.",
    h1: "Something spilled in your Portimão",
    h1Gold: "rental?",
    intro: "It's more common than you'd think — and it's almost always fixable if it's treated properly. We're a professional upholstery and carpet cleaning team covering Portimão and the central Algarve, and we can usually visit the same day.",
    scenarios: [
      { title: "Wine, juice or soft drink spills", body: "Fresh spills are the easiest to fully remove — we use hot-water extraction, not a surface wipe." },
      { title: "Sun cream and oily stains", body: "Need a specific pre-treatment step, which is often where DIY attempts with a damp cloth go wrong." },
      { title: "Mattress or headboard stains", body: "Handled discreetly, with hospital-grade sanitising." },
      { title: "Rugs and carpeted areas", body: "Full extraction cleaning, not just a vacuum pass." },
    ],
    whyUs: [
      "English-speaking technicians",
      "Same-day service across Portimão and the surrounding area",
      "Professional equipment, hotel and holiday-rental grade",
      "5.0★ rating on Google from over 60 verified reviews",
    ],
    faqs: [
      { question: "Can you come the same day?", answer: "In most cases, yes — send us a photo on WhatsApp and we'll confirm a slot." },
      { question: "What if I'm checking out soon?", answer: "Tell us your check-out time when you message and we'll prioritise accordingly — most items are usable again within a few hours." },
    ],
  },
  {
    slug: "emergency-stain-removal-faro",
    audience: "guest",
    citySlug: "faro",
    region: "Algarve",
    title: "Emergency Stain Removal in Faro | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill in your Faro holiday rental before a flight home? Professional same-day upholstery and mattress cleaning, English-speaking team.",
    h1: "Need it fixed before you",
    h1Gold: "fly home?",
    intro: "Faro is often the last stop before a flight home, which makes accidents feel worse than they are — a rushed spill, a mark left on the mattress. We're a professional upholstery cleaning team covering Faro and the surrounding area, and we can often visit the same day, before your flight.",
    scenarios: [
      { title: "Spills before check-out", body: "The most common last-day problem. We prioritise same-day requests near flight times whenever we can." },
      { title: "Mattress or sofa stains", body: "Treated discreetly with professional-grade products, no matter the cause." },
      { title: "General end-of-stay clean", body: "A quick professional pass on the main upholstered pieces before you hand back the keys." },
    ],
    whyUs: [
      "English-speaking team, quick to coordinate by WhatsApp",
      "Same-day appointments, including short notice before a flight",
      "Professional extraction equipment — most items usable again within hours",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "I fly out in a few hours, can you still help?", answer: "Message us straight away with your address and flight time — we'll do our best to fit you in, but the earlier you contact us, the more likely we can help." },
      { question: "Can you coordinate with my host instead of me?", answer: "Yes, we're used to arranging access directly with hosts or property managers when the guest has already left." },
    ],
  },

  // ─── Algarve — host page (1) ───────────────────────────────────────────
  {
    slug: "airbnb-turnover-cleaning-algarve",
    audience: "host",
    citySlug: "albufeira",
    region: "Algarve",
    title: "Emergency Turnover & Damage Cleaning for Algarve Hosts | Kyro Clean",
    metaDescription: "Fast upholstery and carpet cleaning for Airbnb and holiday-let hosts across the Algarve, with before/after photo documentation for damage claims. Same-day service.",
    h1: "Guest damage before the next",
    h1Gold: "check-in?",
    intro: "Running a short-term rental in the Algarve means dealing with the occasional stained sofa, mattress or rug between guests — usually with very little notice before the next check-in. We work with hosts and property managers across the Algarve for exactly this: fast, professional cleaning with proper photo documentation for your records.",
    scenarios: [
      { title: "Same-day turnover cleaning", body: "Guest checks out, damage is found, next guest arrives tomorrow — we prioritise these requests and can usually fit them in the same day." },
      { title: "Photo documentation for deposit or Aircover claims", body: "Airbnb's own claims process requires timestamped, verifiable evidence of damage and its resolution. We document before-and-after as standard on every job, at no extra request needed." },
      { title: "Multi-property accounts", body: "If you manage several listings, we can set up a simple repeat process so cleaning requests are handled quickly without you having to explain the situation from scratch each time." },
      { title: "Preventive protection", body: "For high-turnover properties, we also offer fabric protection treatments that make future stains far easier to remove, reducing how often you need an emergency visit." },
    ],
    whyUs: [
      "English-speaking team, direct WhatsApp coordination",
      "Same-day availability for urgent turnovers",
      "Before/after photo documentation on every job",
      "5.0★ on Google, 60+ verified reviews, professional insured technicians",
    ],
    faqs: [
      { question: "Can you invoice for accounting/tax purposes?", answer: "Yes, we can provide a receipt for every job." },
      { question: "Do you work with property management companies, not just individual hosts?", answer: "Yes — several of our regular clients manage multiple listings across the Algarve." },
      { question: "How fast can you respond to an urgent request?", answer: "In most cases we can confirm a same-day or next-morning slot — message us with the property location and what happened." },
    ],
  },

  // ─── Lisbon area — guest pages (8) ─────────────────────────────────────
  {
    slug: "emergency-stain-removal-lisbon",
    audience: "guest",
    citySlug: "lisboa",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Lisbon | Same-Day Service | Kyro Clean",
    metaDescription: "Wine, food or coffee stain on the sofa in your Lisbon holiday apartment? Professional same-day cleaning, English-speaking team, no need to worry about the deposit.",
    h1: "Spilled something in your Lisbon",
    h1Gold: "apartment?",
    intro: "A glass of Port wine, a coffee spill, a mark on the mattress — it happens, and it's almost always fixable if treated properly and promptly. We're a professional upholstery cleaning team covering Lisbon, and we can usually visit the same day.",
    scenarios: [
      { title: "Wine, port or coffee stains", body: "The sooner they're treated, the better the result — professional hot-water extraction goes well beyond a surface wipe." },
      { title: "Mattress and headboard stains", body: "Handled discreetly, with hospital-grade sanitising, whatever the cause." },
      { title: "Rugs and carpeted stairs (common in older Lisbon apartments)", body: "Full extraction cleaning that lifts dirt from deep in the fibres, not just a vacuum pass." },
      { title: "General end-of-stay refresh", body: "A quick professional pass before check-out if you'd simply like the place to look its best." },
    ],
    whyUs: [
      "English-speaking technicians — no language barrier",
      "Same-day appointments across Lisbon",
      "Professional hot-water extraction equipment",
      "5.0★ rating on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and your address, and we'll confirm a time." },
      { question: "Will it be dry before I check out?", answer: "Most sofas and rugs are usable again within 2-4 hours thanks to our extraction method." },
    ],
  },
  {
    slug: "emergency-stain-removal-cascais",
    audience: "guest",
    citySlug: "cascais",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Cascais | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Cascais holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Cascais",
    h1Gold: "rental?",
    intro: "A spilled drink, sun cream on the sofa, sand ground into a rug — none of it needs to be stressful. We're a professional upholstery cleaning team covering Cascais and the Lisbon coast, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Sun cream and sand", body: "Common after a day at Praia do Guincho or the marina — cleaned without over-wetting delicate fabrics." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability in Cascais and nearby areas",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },

  {
    slug: "emergency-stain-removal-sintra",
    audience: "guest",
    citySlug: "sintra",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Sintra | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Sintra holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Sintra",
    h1Gold: "rental?",
    intro: "Sintra draws visitors year-round for its palaces and hills, and holiday rentals here see plenty of guests coming and going, which means accidents happen too. We're a professional upholstery cleaning team covering Sintra and the greater Lisbon area, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant, whatever the cause." },
      { title: "Rugs and carpeted areas (common in Sintra's older properties)", body: "Full extraction cleaning that lifts dirt from deep in the fibres." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability in Sintra and the greater Lisbon area",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },

  {
    slug: "emergency-stain-removal-oeiras",
    audience: "guest",
    citySlug: "oeiras",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Oeiras | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Oeiras holiday rental between Lisbon and Cascais? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Oeiras",
    h1Gold: "rental?",
    intro: "Oeiras, on the coast between Lisbon and Cascais, is a popular short-term rental area year-round. We're a professional upholstery cleaning team covering Oeiras and the wider Lisbon coast, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Sun cream and sand", body: "Common after a beach day along the Oeiras coastline." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability in Oeiras and the wider Lisbon coast",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-almada",
    audience: "guest",
    citySlug: "almada",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Almada | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Almada holiday rental across the Tejo from Lisbon? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Almada",
    h1Gold: "rental?",
    intro: "Almada, right across the Tejo from Lisbon and home to Cristo Rei, sees a steady flow of short-term rental guests all year. We're a professional upholstery cleaning team covering Almada and the south bank, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "The sooner they're treated, the better the result." },
      { title: "Mattress stains", body: "Treated discreetly, with hospital-grade sanitising." },
      { title: "Rugs and carpeted areas", body: "Full extraction cleaning, not just a vacuum pass." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Almada and the south bank",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and we'll confirm a time." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-setubal",
    audience: "guest",
    citySlug: "setubal",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Setúbal | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Setúbal holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Setúbal",
    h1Gold: "rental?",
    intro: "Setúbal, gateway to the Arrábida coast, is a growing short-term rental destination near Lisbon. We're a professional upholstery cleaning team covering Setúbal and the surrounding area, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Sand and beach-day grime", body: "Common after a day on the Arrábida coast." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Setúbal and the surrounding area",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-sesimbra",
    audience: "guest",
    citySlug: "sesimbra",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Sesimbra | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Sesimbra holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Sesimbra",
    h1Gold: "rental?",
    intro: "Sesimbra's beaches and fishing-village charm make it a popular short-term rental spot south of Lisbon. We're a professional upholstery cleaning team covering Sesimbra and the surrounding area, usually available the same day.",
    scenarios: [
      { title: "Sand, salt and beach-day grime", body: "Common after a day at the beach, cleaned without over-wetting the fibres." },
      { title: "Wine or drink spills", body: "The sooner they're treated, the better the result." },
      { title: "Mattress stains", body: "Treated discreetly, with hospital-grade sanitising." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Sesimbra and the surrounding area",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and we'll confirm a time." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-mafra",
    audience: "guest",
    citySlug: "mafra",
    region: "Lisbon Area",
    title: "Emergency Stain Removal in Mafra | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Mafra holiday rental near Sintra? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Mafra",
    h1Gold: "rental?",
    intro: "Mafra, home to the famous National Palace and close to Ericeira's beaches, is a growing short-term rental base. We're a professional upholstery cleaning team covering Mafra and the surrounding area, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Sand and beach-day grime", body: "Common after a day at nearby Ericeira." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Mafra and the surrounding area",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },

  // ─── Lisbon area — host page (1) ───────────────────────────────────────
  {
    slug: "airbnb-turnover-cleaning-lisbon",
    audience: "host",
    citySlug: "lisboa",
    region: "Lisbon Area",
    title: "Emergency Turnover & Damage Cleaning for Lisbon Hosts | Kyro Clean",
    metaDescription: "Fast upholstery and carpet cleaning for Airbnb and holiday-let hosts in Lisbon, with before/after photo documentation for damage claims. Same-day service.",
    h1: "Guest damage before the next",
    h1Gold: "check-in?",
    intro: "Running a short-term rental in Lisbon means the occasional stained sofa or mattress between guests, usually with little notice. We work with hosts and property managers across Lisbon for exactly this: fast, professional cleaning with proper photo documentation for your records.",
    scenarios: [
      { title: "Same-day turnover cleaning", body: "We prioritise same-day requests when the next guest is already booked in." },
      { title: "Photo documentation for deposit or Aircover claims", body: "Timestamped before-and-after photos are standard on every job, ready for Airbnb's claims process if you need them." },
      { title: "Multi-property accounts", body: "A simple repeat process for hosts managing several listings across Lisbon." },
    ],
    whyUs: [
      "English-speaking team, direct WhatsApp coordination",
      "Same-day availability for urgent turnovers",
      "Before/after photo documentation on every job",
      "5.0★ on Google, professional insured technicians",
    ],
    faqs: [
      { question: "Can you invoice for accounting purposes?", answer: "Yes, we provide a receipt for every job." },
      { question: "Do you work with property management companies?", answer: "Yes, several of our regular clients manage multiple listings across Lisbon." },
    ],
  },

  // ─── Porto area — guest pages (8) ──────────────────────────────────────
  {
    slug: "emergency-stain-removal-porto",
    audience: "guest",
    citySlug: "porto",
    region: "Porto Area",
    title: "Emergency Stain Removal in Porto | Same-Day Service | Kyro Clean",
    metaDescription: "Wine, food or coffee stain on the sofa in your Porto holiday apartment? Professional same-day cleaning, English-speaking team, no need to worry about the deposit.",
    h1: "Spilled something in your Porto",
    h1Gold: "apartment?",
    intro: "A glass of Port wine, a coffee spill, a mark left on the mattress — it happens to most guests at some point, and it's almost always fixable if treated properly. We're a professional upholstery cleaning team based in Porto, and we can usually visit the same day.",
    scenarios: [
      { title: "Wine, port or coffee stains", body: "The sooner they're treated, the better the result — we use professional hot-water extraction, not a surface wipe." },
      { title: "Mattress and headboard stains", body: "Handled discreetly, with hospital-grade sanitising, whatever the cause." },
      { title: "Rugs and carpeted stairs (common in older Porto apartments)", body: "Full extraction cleaning that lifts dirt from deep in the fibres." },
      { title: "General end-of-stay refresh", body: "A quick professional pass before check-out if you'd like the place to look its best." },
    ],
    whyUs: [
      "English-speaking technicians — no language barrier",
      "Same-day appointments across Porto",
      "Professional hot-water extraction equipment",
      "5.0★ rating on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and your address, and we'll confirm a time." },
      { question: "Will it be dry before I check out?", answer: "Most sofas and rugs are usable again within 2-4 hours thanks to our extraction method." },
    ],
  },
  {
    slug: "emergency-stain-removal-vila-nova-de-gaia",
    audience: "guest",
    citySlug: "vila-nova-de-gaia",
    region: "Porto Area",
    title: "Emergency Stain Removal in Vila Nova de Gaia | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Vila Nova de Gaia holiday rental, across the river from Porto? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Gaia",
    h1Gold: "rental?",
    intro: "Vila Nova de Gaia, across the Douro from Porto's Ribeira, has become one of the busiest short-term rental areas in the region, and accidents in a rental are simply part of travel. We're a professional upholstery cleaning team covering Gaia and greater Porto, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant, whatever the cause." },
      { title: "Rugs and carpeted areas", body: "Full extraction cleaning, not just a vacuum pass." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability in Vila Nova de Gaia and greater Porto",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Do you cover both sides of the river?", answer: "Yes, we cover Porto, Gaia and the surrounding municípios as one service area." },
    ],
  },
  {
    slug: "emergency-stain-removal-matosinhos",
    audience: "guest",
    citySlug: "matosinhos",
    region: "Porto Area",
    title: "Emergency Stain Removal in Matosinhos | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Matosinhos holiday rental near Porto's beaches? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Matosinhos",
    h1Gold: "rental?",
    intro: "Matosinhos, right on Porto's coastline, is a popular base for visitors who want beach and city in the same stay, which also means beach sand, salt and the odd spilled drink end up on the sofa or rug. We're a professional upholstery cleaning team covering Matosinhos and greater Porto, usually available the same day.",
    scenarios: [
      { title: "Sand, salt and beach-day grime", body: "Common after a day at Matosinhos beach — cleaned without over-wetting or damaging the fibres." },
      { title: "Wine or drink spills", body: "The sooner they're treated, the better the result." },
      { title: "Mattress stains", body: "Treated discreetly, with hospital-grade sanitising." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Matosinhos and greater Porto",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and we'll confirm a time." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },

  {
    slug: "emergency-stain-removal-povoa-de-varzim",
    audience: "guest",
    citySlug: "povoa-de-varzim",
    region: "Porto Area",
    title: "Emergency Stain Removal in Póvoa de Varzim | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Póvoa de Varzim holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Póvoa de Varzim",
    h1Gold: "rental?",
    intro: "Póvoa de Varzim, on the north coast near Porto, gets a steady stream of holiday-rental guests drawn by the beach and boardwalk. We're a professional upholstery cleaning team covering the north coast and greater Porto, usually available the same day.",
    scenarios: [
      { title: "Sand, salt and beach-day grime", body: "Common after a day on the boardwalk or beach, cleaned without over-wetting or damaging the fibres." },
      { title: "Wine or drink spills", body: "The sooner they're treated, the better the result." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade sanitising." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across the north coast and greater Porto",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and we'll confirm a time." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-vila-do-conde",
    audience: "guest",
    citySlug: "vila-do-conde",
    region: "Porto Area",
    title: "Emergency Stain Removal in Vila do Conde | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Vila do Conde holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Vila do Conde",
    h1Gold: "rental?",
    intro: "Vila do Conde's historic centre and beaches make it a popular short-term rental spot on the north coast. We're a professional upholstery cleaning team covering the area and greater Porto, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Sand and beach-day grime", body: "Cleaned without over-wetting or damaging delicate fabrics." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Vila do Conde and greater Porto",
      "Professional hot-water extraction, not a rented carpet cleaner",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-espinho",
    audience: "guest",
    citySlug: "espinho",
    region: "Porto Area",
    title: "Emergency Stain Removal in Espinho | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Espinho holiday rental south of Porto? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Espinho",
    h1Gold: "rental?",
    intro: "Espinho's beach and casino draw a steady flow of short-term rental guests just south of Porto. We're a professional upholstery cleaning team covering Espinho and greater Porto, usually available the same day.",
    scenarios: [
      { title: "Sand, salt and beach-day grime", body: "Common after a day at the beach, cleaned without over-wetting the fibres." },
      { title: "Wine or drink spills", body: "The sooner they're treated, the better the result." },
      { title: "Mattress stains", body: "Treated discreetly, with hospital-grade sanitising." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Espinho and greater Porto",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "Can you come today?", answer: "In most cases yes — message us on WhatsApp with a photo of the stain and we'll confirm a time." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-braga",
    audience: "guest",
    citySlug: "braga",
    region: "Porto Area",
    title: "Emergency Stain Removal in Braga | Same-Day Service | Kyro Clean",
    metaDescription: "Accident on the sofa, rug or mattress in your Braga holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Accident in your Braga",
    h1Gold: "rental?",
    intro: "Braga's historic centre is a busy short-term rental destination year-round, and accidents in a rental are simply part of travel. We're a professional upholstery cleaning team covering Braga and the surrounding area, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant, whatever the cause." },
      { title: "Rugs and carpeted areas (common in Braga's older apartments)", body: "Full extraction cleaning that lifts dirt from deep in the fibres." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Braga and the surrounding area",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },
  {
    slug: "emergency-stain-removal-guimaraes",
    audience: "guest",
    citySlug: "guimaraes",
    region: "Porto Area",
    title: "Emergency Stain Removal in Guimarães | Same-Day Service | Kyro Clean",
    metaDescription: "Stain or spill on the sofa, rug or mattress in your Guimarães holiday rental? Professional same-day cleaning, English-speaking team.",
    h1: "Spilled something in your Guimarães",
    h1Gold: "rental?",
    intro: "Guimarães, a UNESCO World Heritage city, is a popular short-term rental base year-round. We're a professional upholstery cleaning team covering Guimarães and the surrounding area, usually available the same day.",
    scenarios: [
      { title: "Wine or drink spills on the sofa", body: "Fresh spills respond very well to professional extraction, even a few hours later." },
      { title: "Mattress stains", body: "Treated discreetly with hospital-grade disinfectant, whatever the cause." },
      { title: "Rugs and carpeted areas (common in Guimarães's historic buildings)", body: "Full extraction cleaning that lifts dirt from deep in the fibres." },
    ],
    whyUs: [
      "English-speaking team",
      "Same-day availability across Guimarães and the surrounding area",
      "Professional hot-water extraction equipment",
      "5.0★ on Google, 60+ verified reviews",
    ],
    faqs: [
      { question: "How quickly can you get here?", answer: "Usually within a few hours of confirming — message us with your location as soon as possible." },
      { question: "Is it expensive?", answer: "We always confirm the price before starting, based on the item and size — no surprises." },
    ],
  },

  // ─── Porto area — host page (1) ────────────────────────────────────────
  {
    slug: "airbnb-turnover-cleaning-porto",
    audience: "host",
    citySlug: "porto",
    region: "Porto Area",
    title: "Emergency Turnover & Damage Cleaning for Porto Hosts | Kyro Clean",
    metaDescription: "Fast upholstery and carpet cleaning for Airbnb and holiday-let hosts in Porto, with before/after photo documentation for damage claims. Same-day service.",
    h1: "Guest damage before the next",
    h1Gold: "check-in?",
    intro: "Running a short-term rental in Porto means the occasional stained sofa or mattress between guests, usually with little notice. We work with hosts and property managers across Porto for exactly this: fast, professional cleaning with proper photo documentation for your records.",
    scenarios: [
      { title: "Same-day turnover cleaning", body: "We prioritise same-day requests when the next guest is already booked in." },
      { title: "Photo documentation for deposit or Aircover claims", body: "Timestamped before-and-after photos are standard on every job, ready for Airbnb's claims process if you need them." },
      { title: "Multi-property accounts", body: "A simple repeat process for hosts managing several listings across Porto." },
    ],
    whyUs: [
      "English-speaking team, direct WhatsApp coordination",
      "Same-day availability for urgent turnovers",
      "Before/after photo documentation on every job",
      "5.0★ on Google, professional insured technicians",
    ],
    faqs: [
      { question: "Can you invoice for accounting purposes?", answer: "Yes, we provide a receipt for every job." },
      { question: "Do you work with property management companies?", answer: "Yes, several of our regular clients manage multiple listings across Porto." },
    ],
  },
];

export function getEnPageBySlug(slug: string): EnPageData | null {
  return EN_PAGES.find(p => p.slug === slug) || null;
}

export function getAllEnRoutes(): { path: string; slug: string }[] {
  return EN_PAGES.map(p => ({ path: `/en/${p.slug}`, slug: p.slug }));
}
