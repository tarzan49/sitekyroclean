export const SITE_URL = "https://cleansolutions.com.pt";

export const PHONE_DISPLAY = "925 530 647";
export const PHONE_TEL = "925530647";
export const PHONE_E164 = "+351925530647";
export const WHATSAPP_BASE = "https://wa.me/351925530647";

// Identidade legal. Preencher o NIF liga automaticamente tres coisas: a linha
// no rodape, o campo `vatID` no schema do negocio e o `taxID`. Enquanto
// estiver vazio, nada disso e emitido, em vez de sair um campo vazio ou
// inventado. E o unico dado que falta para uma entidade poder ser confirmada
// fora do proprio site.
// Anotado como `string` e nao deixado a inferir `""`: sem a anotacao o tipo
// literal da constante vazia fazia `...(BUSINESS_TAX_ID && { vatID })` em
// seoSchema.ts rebentar no typecheck (TS2698).
export const BUSINESS_TAX_ID: string = "";

// Perfis proprios noutras plataformas, para o `sameAs`. Confirmado em
// 2026-09-17 que nao existe nenhum. Acrescentar um URL aqui basta: o
// `sameAs` do negocio junta-os a ficha do Google sozinho.
export const BUSINESS_PROFILES: string[] = [];

export const BUSINESS_EMAIL = "cleansolutions.pt25@gmail.com";
export const BUSINESS_EMAIL_HREF = `mailto:${BUSINESS_EMAIL}`;

export const BUSINESS_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Rua de Ferreira Cardoso 174",
  addressLocality: "Porto",
  postalCode: "4300-197",
  addressCountry: "PT",
} as const;

export const BUSINESS_GEO = {
  "@type": "GeoCoordinates",
  latitude: 41.147231,
  longitude: -8.596869,
} as const;

export const REVIEW_RATING = "4.9";
export const REVIEW_COUNT = "125";
export const CLIENTS_SERVED_LABEL = "+1100";

export const SERVICES_COMPLETED_LABEL = "+1200";
