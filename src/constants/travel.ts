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
  // Zona 3 — Interior norte, ~35-45 min
  'Penafiel': 15,
  'Paços de Ferreira': 15,
  'Felgueiras': 15,
  'Lousada': 15,
  // Zona 4 — Mais afastado, ~45-55 min
  'Arouca': 20,
  // Zona 3 — Centro, sem equipa própria, deslocação a partir do Porto (2026-09-10, corrigido a pedido do dono)
  'Aveiro': 15,
  'Coimbra': 15,
  // ═══ Braga/Minho (equipa local, escalões por distância ao centro de Braga) ═══
  // Referência ao centro de Braga: até 10 km = 10€; até 15 km = 15€; acima = 20€.
  // Escalões por sede de concelho; a morada concreta é confirmada no orçamento.
  'Braga': 10,
  'Guimarães': 20,
  'Vila Nova de Famalicão': 20,
  'Barcelos': 20,
  'Viana do Castelo': 20,
  'Póvoa de Lanhoso': 15,
  'Fafe': 20,
  'Esposende': 20,

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
