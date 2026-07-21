import heroSofa          from "@/assets/hero-sofa-cleaning-new.webp";
import heroCarpet        from "@/assets/hero-carpet-cleaning-new.webp";

// Imagens específicas por material (mesmas usadas nas páginas de "problema" com
// slug igual ao do material — ex: hero-p-limpeza-sofa-tecido.webp já existia,
// só nunca tinha sido ligada ao MaterialPage). NUNCA reutilizar a imagem de um
// material diferente (ex: pele numa página de tecido).
import sofaTecido    from "@/assets/hero-p-limpeza-sofa-tecido.webp";
import sofaVeludo    from "@/assets/hero-p-limpeza-sofa-veludo.webp";
import sofaPele      from "@/assets/hero-p-limpeza-sofa-pele.webp";
import sofaMicrofibra from "@/assets/hero-p-sofa-microfibras.webp";
import sofaCamurca   from "@/assets/service-sofa-camurca.webp";
import tapetePersa   from "@/assets/hero-p-tapete-persa.webp";
import tapeteLa      from "@/assets/hero-p-tapete-la.webp";

export const MATERIAL_HERO_FALLBACK = heroSofa;

// Materiais sem foto dedicada ainda (linho, sintético sofá/tapete, sisal) usam
// a foto genérica do serviço (neutra, não identifica um material específico
// diferente) até termos fotos próprias — nunca a foto de outro material.
export const MATERIAL_HERO: Record<string, string> = {
  "limpeza-sofa-tecido":      sofaTecido,
  "limpeza-sofa-veludo":      sofaVeludo,
  "limpeza-sofa-pele":        sofaPele,
  "limpeza-sofa-microfibra":  sofaMicrofibra,
  "limpeza-sofa-camurca":     sofaCamurca,
  "limpeza-sofa-linho":       heroSofa,
  "limpeza-sofa-sintetico":   heroSofa,
  "limpeza-tapete-la":        tapeteLa,
  "limpeza-tapete-persa":     tapetePersa,
  "limpeza-tapete-sintetico": heroCarpet,
  "limpeza-tapete-sisal":     heroCarpet,
};

// Materiais que ainda não têm foto própria — mostrar a foto genérica do
// serviço em vez de arriscar mostrar o material errado.
export const MATERIALS_WITHOUT_DEDICATED_PHOTO = new Set([
  "limpeza-sofa-linho",
  "limpeza-sofa-sintetico",
  "limpeza-tapete-sintetico",
  "limpeza-tapete-sisal",
]);
