// ── Imagens específicas por problema (1200×675 WebP, ~40–155 KB) ──────────────
import hpManchasVinhoSofa    from "@/assets/hero-p-manchas-vinho-sofa.webp";
import hpManchasCafeSofa     from "@/assets/hero-p-manchas-cafe-sofa.webp";
import hpManchaGorduraSofa   from "@/assets/hero-p-mancha-gordura-sofa.webp";
import hpManchasColchao      from "@/assets/hero-p-manchas-colchao.webp";
import hpManchasTapete       from "@/assets/hero-p-manchas-tapete.webp";
import hpMauCheiroSofa       from "@/assets/hero-p-mau-cheiro-sofa.webp";
import hpUrinaSofa           from "@/assets/hero-p-urina-sofa.webp";
import hpMauCheiroColchao    from "@/assets/hero-p-mau-cheiro-colchao.webp";
import hpMauCheiroTapete     from "@/assets/hero-p-mau-cheiro-tapete.webp";
import hpAcarosColchao       from "@/assets/hero-p-acaros-colchao.webp";
import hpAcarosSofa          from "@/assets/hero-p-acaros-sofa.webp";
import hpAcarosTapete        from "@/assets/hero-p-acaros-tapete.webp";
import hpAlergiasSofa        from "@/assets/hero-p-alergias-sofa.webp";
import hpAlergiasColchao     from "@/assets/hero-p-alergias-colchao.webp";
import hpPelosSofa           from "@/assets/hero-p-pelos-sofa.webp";
import hpPelosTapete         from "@/assets/hero-p-pelos-tapete.webp";
import hpLimpezaSofaTecido   from "@/assets/hero-p-limpeza-sofa-tecido.webp";
import hpLimpezaSofaPele     from "@/assets/hero-p-limpeza-sofa-pele.webp";
import hpLimpezaSofaVeludo   from "@/assets/hero-p-limpeza-sofa-veludo.webp";
import hpSofaMicrofibras     from "@/assets/hero-p-sofa-microfibras.webp";
import hpSofaChenille        from "@/assets/hero-p-sofa-chenille.webp";
import hpLimpezaPuff         from "@/assets/hero-p-limpeza-puff.webp";
import hpSofaAmarelado       from "@/assets/hero-p-sofa-amarelado.webp";
import hpSofaDesgastado      from "@/assets/hero-p-sofa-desgastado.webp";
import hpManchasSurSofa      from "@/assets/hero-p-manchas-suor-sofa.webp";
import hpManchaTinta         from "@/assets/hero-p-mancha-tinta.webp";
import hpSangueColchao       from "@/assets/hero-p-sangue-colchao.webp";
import hpTapetePersa         from "@/assets/hero-p-tapete-persa.webp";
import hpTapeteLa            from "@/assets/hero-p-tapete-la.webp";
import hpMofoTapete          from "@/assets/hero-p-mofo-tapete.webp";
import hpMofoAlcatifa        from "@/assets/hero-p-mofo-alcatifa.webp";
import hpLimpezaTapetes      from "@/assets/hero-p-limpeza-tapetes.webp";
import hpLimpezaCadeiras     from "@/assets/hero-p-limpeza-cadeiras.webp";
import hpLimpezaAlcatifas    from "@/assets/hero-p-limpeza-alcatifas.webp";
import hpLimpezaSofaHotel    from "@/assets/hero-p-limpeza-sofa-hotel.webp";
import hpLimpezaColchaoHotel from "@/assets/hero-p-limpeza-colchao-hotel.webp";
import hpLimpezaSofaStd      from "@/assets/hero-p-limpeza-sofa-std.webp";
import hpLimpezaColchaoStd   from "@/assets/hero-p-limpeza-colchao-std.webp";

const MAP: Record<string, string> = {
  // ── MANCHAS SOFÁ ─────────────────────────────────────────────────────────────
  "manchas-sofa":               hpManchasVinhoSofa,
  "manchas-vinho-sofa":         hpManchasVinhoSofa,
  "manchas-cafe-sofa":          hpManchasCafeSofa,
  "manchas-gordura-sofa":       hpManchaGorduraSofa,
  "manchas-tinta-sofa":         hpManchaTinta,
  "manchas-suor-sofa":          hpManchasSurSofa,
  "sofa-amarelado":             hpSofaAmarelado,
  "limpeza-sofa-antes-depois":  hpManchasVinhoSofa,

  // ── MANCHAS COLCHÃO ───────────────────────────────────────────────────────────
  "manchas-colchao":            hpManchasColchao,
  "manchas-sangue-colchao":     hpSangueColchao,
  "urina-colchao":              hpMauCheiroColchao,

  // ── MANCHAS TAPETE ────────────────────────────────────────────────────────────
  "manchas-tapete":             hpManchasTapete,

  // ── CHEIROS / ODORES ──────────────────────────────────────────────────────────
  "cheiro-sofa":                hpMauCheiroSofa,
  "cheiro-urina-sofa":          hpUrinaSofa,
  "cheiro-colchao":             hpMauCheiroColchao,
  "cheiro-tapete":              hpMauCheiroTapete,

  // ── PELOS DE ANIMAIS ──────────────────────────────────────────────────────────
  "pelos-animais-sofa":         hpPelosSofa,
  "pelos-animais-tapete":       hpPelosTapete,

  // ── ÁCAROS ────────────────────────────────────────────────────────────────────
  "acaros-sofa":                hpAcarosSofa,
  "acaros-colchao":             hpAcarosColchao,
  "acaros-tapete":              hpAcarosTapete,

  // ── ALERGIAS ──────────────────────────────────────────────────────────────────
  "alergias-sofa":              hpAlergiasSofa,
  "alergias-colchao":           hpAlergiasColchao,
  "limpeza-sofa-bebe":          hpAlergiasSofa,
  "limpeza-colchao-bebe":       hpAlergiasColchao,

  // ── LIMPEZA SOFÁ — por material ───────────────────────────────────────────────
  "limpeza-sofa-tecido":        hpLimpezaSofaTecido,
  "limpeza-sofa-pele":          hpLimpezaSofaPele,
  "limpeza-sofa-veludo":        hpLimpezaSofaVeludo,
  "limpeza-sofa-microfibra":    hpSofaMicrofibras,
  "limpeza-sofa-chenille":      hpSofaChenille,
  "limpeza-puff":               hpLimpezaPuff,
  "limpeza-cabeceira-cama":     hpLimpezaSofaPele,

  // ── LIMPEZA SOFÁ — por contexto ───────────────────────────────────────────────
  "limpeza-profunda-sofa":      hpLimpezaSofaTecido,
  "limpeza-sofa-domicilio":     hpLimpezaSofaStd,
  "limpeza-sofa-profissional":  hpLimpezaSofaStd,
  "limpeza-sofa-hotel":         hpLimpezaSofaHotel,
  "limpeza-sofa-urgente":       hpLimpezaSofaStd,
  "limpeza-sofa-perto-de-mim":  hpLimpezaSofaStd,
  "empresa-limpeza-estofos":    hpLimpezaSofaStd,

  // ── PREÇOS ────────────────────────────────────────────────────────────────────
  "preco-limpeza-sofa":         hpLimpezaSofaTecido,
  "preco-limpeza-colchao":      hpLimpezaColchaoHotel,
  "preco-limpeza-tapete":       hpLimpezaTapetes,

  // ── COLCHÃO ───────────────────────────────────────────────────────────────────
  "higienizacao-colchao":       hpLimpezaColchaoStd,
  "limpeza-colchao-urgente":    hpLimpezaColchaoStd,

  // ── IMPERMEABILIZAÇÃO ─────────────────────────────────────────────────────────
  "impermeabilizar-sofa":       hpSofaDesgastado,

  // ── TAPETE / ALCATIFA ─────────────────────────────────────────────────────────
  "tapete-persa":               hpTapetePersa,
  "tapete-la":                  hpTapeteLa,
  "mofo-tapete":                hpMofoTapete,
  "mofo-alcatifa":              hpMofoAlcatifa,
  "lavagem-tapetes":            hpLimpezaTapetes,   // já é a imagem padrão de tapetes
  "limpeza-alcatifas-empresa":  hpLimpezaAlcatifas,

  // ── CADEIRAS ──────────────────────────────────────────────────────────────────
  "limpeza-cadeiras-escritorio":hpLimpezaCadeiras,
};

export function getProblemHeroImage(slug: string): string {
  if (MAP[slug]) return MAP[slug];

  // Fallbacks por tipo de superfície
  if (slug.includes("sofa") || slug.includes("puff"))            return hpLimpezaSofaTecido;
  if (slug.includes("colchao") || slug.includes("cabeceira"))    return hpLimpezaColchaoHotel;
  if (slug.includes("alcatif"))                                   return hpLimpezaAlcatifas;
  if (slug.includes("tapete"))                                    return hpLimpezaTapetes;
  if (slug.includes("cadeira"))                                   return hpLimpezaCadeiras;

  // Fallbacks por tipo de problema
  if (slug.includes("mancha") || slug.includes("sangue"))        return hpManchasVinhoSofa;
  if (slug.includes("urina") || slug.includes("cheiro"))         return hpMauCheiroSofa;
  if (slug.includes("acar")  || slug.includes("alerg"))          return hpAcarosSofa;
  if (slug.includes("pelo"))                                      return hpPelosSofa;
  if (slug.includes("mofo")  || slug.includes("bolor"))          return hpMofoTapete;
  if (slug.includes("impermeabiliz") || slug.includes("desgast"))return hpSofaDesgastado;

  return hpLimpezaSofaTecido;
}
