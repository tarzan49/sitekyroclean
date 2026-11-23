import { isBlackFriday } from './campaigns';

// Fonte única de deslocações para o formulário e as páginas geradas.
export const locationPrices: Record<string, number> = {
  // ═══ Porto/Norte (equipa Porto) ═══
  // Zona 0 — Porto metropolitan core
  'Porto': 10,
  'Matosinhos': 10,
  // Zona 1 — Subúrbios imediatos, ~10-20 min
  'Vila Nova de Gaia': 10,
  'Maia': 10,
  'Gondomar': 10,
  // Zona 2 — Grande Porto, ~20-30 min
  'Valongo': 10,
  'Espinho': 10,
  'Póvoa de Varzim': 10,
  'Vila do Conde': 10,
  'Santo Tirso': 10,
  'Trofa': 10,
  'Paredes': 10,
  'Santa Maria da Feira': 10, // ~27 min pela A1, vizinha de Espinho (2026-09-26)
  // Zona 3 — Interior norte, ~35-45 min
  'Penafiel': 15,
  'Paços de Ferreira': 15,
  'Felgueiras': 15,
  'Lousada': 15,
  // Zona 3 — Sul do Douro, ~33-37 min, como Penafiel (2026-09-26, entraram na
  // campanha de Google Ads do Porto e o questionário recusava-as)
  'São João da Madeira': 15,
  'Ovar': 15,
  'Oliveira de Azeméis': 15,
  // Zona 4 — Mais afastado, ~45-55 min
  'Arouca': 20,
  // Aveiro — Centro, deslocação a partir do Porto (2026-09-10, corrigido a pedido do dono)
  'Aveiro': 15,
  // ═══ Coimbra e Centro (trabalhador local desde 2026-09-28) ═══
  // Dono, 2026-09-28: Coimbra 10€, arredores próximos 15€, mais longe 20€
  // (mesma lógica de escalões da equipa de Braga). Deixou de ser deslocação
  // alargada: saiu de EXTENDED_TRIP_CITIES.
  'Coimbra': 10,
  'Figueira da Foz': 20, // ~45 min pela A14
  // Dono, 2026-11-15: escalões pelo centro de Leiria (como Braga):
  // centro 10€, arredores próximos (até ~15 km) 15€, mais longe 20€.
  'Leiria': 10,
  'Batalha': 15,
  'Marinha Grande': 15,
  'Porto de Mós': 20,
  'Ourém': 20,
  'Fátima': 20,
  'Pombal': 20,
  'Alcobaça': 20,
  'Nazaré': 20,
  // ═══ Madeira (dono, 2026-11-15): escalões pelo centro do Funchal ═══
  'Funchal': 10,
  'Câmara de Lobos': 15,
  'Caniço': 15,
  'Santa Cruz': 20,
  'Machico': 20,
  // ═══ Braga/Minho (equipa local, escalões por distância ao centro de Braga) ═══
  // Dono, 2026-11-18: Minho só 10€ ou 15€ (perto das equipas de Braga ou de Viana = 10€, resto 15€).
  // Escalões por sede de concelho; a morada concreta é confirmada no orçamento.
  'Braga': 10,
  'Guimarães': 15,
  'Vila Nova de Famalicão': 15,
  'Barcelos': 15,
  'Viana do Castelo': 10,
  'Póvoa de Lanhoso': 15,
  'Fafe': 15,
  'Esposende': 15,
  'Vizela': 15,
  'Amares': 10,
  'Vila Verde': 15,

  // ═══ Lisboa / Área Metropolitana (equipa local) ═══
  // Lisboa: mínimo 10€, máximo 15€.
  // Zona 0 — Lisboa
  'Lisboa': 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Amadora': 10,
  'Odivelas': 10,
  'Oeiras': 10,
  // Zona 2 — Grande Lisboa, ~20-30 min
  'Cascais': 10,
  'Sintra': 10,
  'Loures': 10,
  'Almada': 10,
  'Seixal': 10,
  // Zona 3 — Mais afastado, ~30-40 min
  'Vila Franca de Xira': 15,
  'Barreiro': 15,
  'Moita': 15,
  'Mafra': 15,
  // Zona 4 — Extremos da AML, ~40-50 min
  'Setúbal': 15,
  'Montijo': 15,
  'Alcochete': 15,
  'Palmela': 15,
  'Sesimbra': 15,
  // Alentejo Litoral — equipa Lisboa, ~1h a 1h35. Disponibilidade sob consulta,
  // ver EXTENDED_TRIP_CITIES. (2026-09-26, entraram na campanha de Lisboa.)
  // Alcácer do Sal fica a 15€ (inclui a Comporta, o limite sul do dono). A sul
  // da Comporta é 20€ (dono, 2026-09-28), e os anúncios deixaram de lá chegar.
  'Alcácer do Sal': 15,
  'Grândola': 20,
  'Santiago do Cacém': 20,
  'Sines': 20,

  // ═══ Algarve (equipa local) ═══
  // Algarve: 10€ no centro, 15€ na zona ocidental e 25€ nos extremos/interior.
  // Zona 0 — Faro/Loulé
  'Faro': 10,
  'Loulé': 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Albufeira': 10,
  'São Brás de Alportel': 10,
  'Olhão': 10,
  // Zona 2 — Algarve central, ~20-30 min
  'Silves': 10,
  'Lagoa': 10,
  'Tavira': 10,
  // Zona 3 — Algarve ocidental, ~30-40 min
  'Portimão': 15,
  'Lagos': 15,
  // Zona 4 — Extremos, ~40-55 min
  'Vila Real de Santo António': 25,
  'Castro Marim': 25,
  'Monchique': 25,
  // Zona 5 — Interior/Costa Vicentina, ~55-70 min
  'Aljezur': 25,
  'Vila do Bispo': 25,
  'Alcoutim': 25,
};

/**
 * Cidades sem equipa por perto, servidas por deslocação alargada a partir de
 * outra base: Aveiro pela equipa do Porto, o Alentejo Litoral pela de Lisboa.
 * As páginas destas cidades dizem "Disponibilidade sob consulta". Coimbra saiu
 * desta lista a 2026-09-28, quando passou a ter trabalhador local.
 * Fonte única: a lista vivia escrita à mão (`Aveiro || Coimbra`) em três sítios.
 */
export const EXTENDED_TRIP_CITIES: ReadonlySet<string> = new Set([
  'Aveiro',
  'Alcácer do Sal', 'Grândola', 'Santiago do Cacém', 'Sines',
]);

/**
 * Pedido pequeno longe de Odivelas (dono, 23 Nov 2026): "de odivelas os serviços abaixo de 49 euros tens
 * q acrescentar mais 10 euros para aqueles q ficam a mais de 20 km de carro". A margem sul fica de fora
 * (o Rodolfo, em Fernão Ferro, vai a praticamente todo o lado). Distâncias por estrada a partir de Odivelas
 * (OSRM, 23 Nov): Lisboa, Amadora e Loures ficam todas abaixo de 20 km; Oeiras vila 22,5, Paço de Arcos 20,9,
 * Porto Salvo 20,8; Sintra vila 27,6, Rio de Mouro 22,9, Mem Martins 23,2; Cascais 23 a 35; Vila Franca 27 a 35
 * (Alverca 26,8); Mafra 21 a 43. As freguesias perto (até 20 km) ficam sem acréscimo.
 */
export const SMALL_ORDER_FAR_SURCHARGE = 10;
export const SMALL_ORDER_FAR_MIN = 49;
export const SMALL_ORDER_FAR_CITIES: ReadonlySet<string> = new Set(['Oeiras', 'Sintra', 'Cascais', 'Vila Franca de Xira', 'Mafra']);
/** Freguesias desses concelhos a 20 km ou menos de Odivelas por estrada (23 Nov 2026). */
export const SMALL_ORDER_NEAR_PARISHES: readonly string[] = [
  // Oeiras: Algés 18,1, Linda-a-Velha 14,3, Cruz Quebrada 16,2, Dafundo 15, Carnaxide 14,6, Queijas 16,1, Barcarena 16,6
  'Algés', 'Linda-a-Velha', 'Cruz Quebrada', 'Dafundo', 'Carnaxide', 'Queijas', 'Barcarena',
  // Sintra: Casal de Cambra 7,3, Queluz 10,5, Belas 14,6, Massamá 15,7, Monte Abraão 14,3, Cacém 17,5, Agualva 16,1, Mira-Sintra 17,7, Almargem do Bispo 14,4
  'Casal de Cambra', 'Queluz', 'Belas', 'Massamá', 'Monte Abraão', 'Cacém', 'Agualva', 'Mira-Sintra', 'Almargem do Bispo',
  // Vila Franca de Xira: Póvoa de Santa Iria 17,9, Forte da Casa 19,7, Vialonga 20
  'Póvoa de Santa Iria', 'Forte da Casa', 'Vialonga',
];
const foldPlace = (v: string) => ` ${v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
/** O sítio fica a mais de 20 km de carro de Odivelas: concelho da lista e o texto do sítio (freguesia) sem nenhuma freguesia perto. */
export function isSmallOrderFarPlace(city: string | null | undefined, place?: string | null): boolean {
  if (!city || !SMALL_ORDER_FAR_CITIES.has(city)) return false;
  const text = foldPlace(place ?? '');
  return !SMALL_ORDER_NEAR_PARISHES.some(p => text.includes(foldPlace(p)));
}
/** Acréscimo de um serviço pequeno longe de Odivelas: 10€ quando o valor dos serviços (sem deslocação) fica abaixo de 49€. */
export function smallOrderFarSurcharge(city: string | null | undefined, place: string | null | undefined, servicesTotal: number): number {
  return servicesTotal > 0 && servicesTotal < SMALL_ORDER_FAR_MIN && isSmallOrderFarPlace(city, place) ? SMALL_ORDER_FAR_SURCHARGE : 0;
}
export const SMALL_ORDER_FAR_RULE = `Longe de Odivelas (mais de 20 km de carro), um serviço abaixo de ${SMALL_ORDER_FAR_MIN}€ leva mais ${SMALL_ORDER_FAR_SURCHARGE}€ (já está no total). Diz numa frase que é por ser um serviço pequeno nesta zona e que, se juntar outra peça na mesma visita, deixa de ter esse acréscimo.`;

/** Services and extras at their actual quoted prices, excluding travel. */
export function calculateTravelFee(baseFee: number, servicesTotal: number): number {
  if (isBlackFriday()) return 0;
  if (!Number.isFinite(servicesTotal) || servicesTotal < 0) return baseFee;
  const cents = Math.round(servicesTotal * 100);
  if ((baseFee === 10 && cents > 12000) ||
      (baseFee === 15 && cents > 13500) ||
      (baseFee === 20 && cents >= 15000)) return 0;
  return baseFee;
}
