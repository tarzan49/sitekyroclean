export const GOOGLE_PLACE_ID = "ChIJt71NLgBlJA0RIT9kggF_3Fk";
export const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
export const GOOGLE_MAPS_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;
// Liga diretamente às avaliações da Kyro (não expira, ao contrário de links curtos share.google)
export const GOOGLE_REVIEWS_VIEW_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;

// Pedidos de avaliação por WhatsApp (dono, 2026-10-06): há duas fichas. Quem
// foi servido pelas equipas de Lisboa (Grande Lisboa, Margem Sul, Setúbal,
// Alentejo Litoral) avalia na ficha de Lisboa; os outros na do Porto, que é a
// do GOOGLE_PLACE_ID. Uma avaliação na ficha errada não sobe a nota da certa,
// e nunca vão os dois links na mesma mensagem.
export const GOOGLE_REVIEW_LINK_PORTO = "https://g.page/r/CSE_ZIIBf9xZEBM/review";
export const GOOGLE_REVIEW_LINK_LISBOA = "https://g.page/r/CRc7F7lX3xcEECE/review";
