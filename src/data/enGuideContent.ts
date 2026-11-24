// Conteúdo do guia /en/airbnb-portugal-cleaning-guide: lido pela página (EnGuidePage) e pelo prerender, para o
// HTML estático dizer o mesmo que a página.
import { SOFA_CLEANING_FROM, MATTRESS_CLEANING_FROM } from './enginePrices';

export const EN_GUIDE_DESCRIPTION = "A practical guide for Airbnb and short-term rental hosts in Portugal: turnover cleaning timelines, what to photograph for damage claims, and realistic costs for sofa, mattress and rug cleaning.";

export const EN_GUIDE_SECTIONS = [
  {
    id: "why-this-guide",
    title: "Why this guide exists",
    body: [
      "Portugal's short-term rental market runs on a different rhythm to a normal home: guests change every few days, cleaning windows are short, and when something does go wrong, there's rarely more than a few hours between spotting the damage and the next check-in.",
      "This guide is written for hosts and property managers running Airbnb, Booking.com or independent short-term rentals in Porto, Lisbon and the Algarve, based on what we see doing turnover and emergency cleaning for rental properties across all three regions.",
    ],
  },
  {
    id: "cleaning-standards",
    title: "The cleaning standard guests expect",
    body: [
      "Guest expectations in short-term rentals are higher than in a typical household clean, because the guest is comparing your listing photos to what they're standing in. A sofa with a visible watermark, a mattress with a faint stain under the sheet, or a rug that smells of the last guest's pet are the kind of details that show up in reviews.",
      "Regular vacuuming and surface wiping between stays is not the same as periodic deep cleaning. Upholstery, mattresses and rugs accumulate dust mites, body oils and odour over weeks of guest turnover even when the property looks clean on the surface; a professional extraction clean every few months (more often for high-turnover listings) keeps that baseline from building up between the emergency visits.",
    ],
  },
  {
    id: "documentation",
    title: "What to document when a guest causes damage",
    body: [
      "Most short-term rental platforms' damage and deposit claims processes ask hosts to provide clear, dated evidence: typically a before photo (or your standard listing photos, if the item wasn't damaged when the guest checked in), a photo of the damage itself, and a photo or receipt showing it was professionally addressed. Vague descriptions without photos are the most common reason claims get delayed or rejected.",
      "Practically, that means: photograph the item as soon as you notice the damage, before any cleaning is attempted. Keep the guest's check-in and check-out dates on hand. If you call in a professional cleaner, ask for before-and-after photos as part of the job (we provide these on every visit as standard, not as a special request) and keep the receipt; it's your proof the damage was real and that you took reasonable steps to resolve it.",
    ],
  },
  {
    id: "turnover-timelines",
    title: "Realistic turnover cleaning timelines",
    body: [
      "A same-day emergency clean is possible in most cases if you contact us in the morning for an afternoon check-in, but it depends on our schedule that day and where the property is; the earlier in the day you reach out, the more likely we can fit it in before your next guest arrives.",
      "For planned deep cleans (not emergencies), we recommend booking a few days ahead where possible, especially during the Algarve's peak summer season when demand is highest across the region.",
    ],
  },
  {
    id: "costs",
    title: "Realistic costs",
    body: [
      `Sofa cleaning starts from €${SOFA_CLEANING_FROM} and mattress cleaning from €${MATTRESS_CLEANING_FROM}; rugs are measured and quoted individually rather than a fixed per-m² rate. Exact pricing depends on the size and condition of the item and is always confirmed before we start, so there are no surprises on the invoice you show your guest or platform.`,
      "If a single listing needs regular attention, ask about a standing arrangement; several hosts we work with have us on a recurring schedule rather than calling for each individual incident.",
    ],
  },
];

export const EN_GUIDE_FAQS = [
  { question: "Do you provide before-and-after photos automatically?", answer: "Yes, on every job; it's part of our standard process, not something you need to request." },
  { question: "Can you invoice for accounting or tax purposes?", answer: "Yes, we provide a receipt for every job, itemised on request." },
  { question: "Do you work with property management companies, not just individual hosts?", answer: "Yes, several of our regular clients manage multiple listings across the Algarve, Lisbon and Porto." },
  { question: "What if the guest has already checked out and I'm not at the property?", answer: "We're used to coordinating directly with hosts remotely; send us photos and address, and we can liaise with a cleaner, keyholder or the next guest's check-in time directly." },
  { question: "Do you cover areas outside Porto, Lisbon and the Algarve?", answer: "Our English-language service is focused on these three regions, where the vast majority of short-term rental demand in Portugal is concentrated, but message us and we'll let you know if we can help." },
];

export const EN_GUIDE_TAKEAWAYS = [
  'Photograph damage before cleaning it: timestamped before/after is the standard most platforms ask for.',
  'Same-day is often possible, but the earlier in the day you reach out, the better your odds.',
  `Prices start from €${SOFA_CLEANING_FROM} (sofa) / €${MATTRESS_CLEANING_FROM} (mattress); rugs are quoted per piece, always confirmed before we start.`,
  'Before/after photo documentation is standard on every job, no need to request it separately.',
];
