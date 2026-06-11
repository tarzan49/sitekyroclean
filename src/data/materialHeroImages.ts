import heroSofa          from "@/assets/hero-sofa-cleaning-new.webp";
import heroRug           from "@/assets/hero-rug-cleaning-new.webp";
import heroCarpet        from "@/assets/hero-carpet-cleaning-new.webp";
import sofaProcesso      from "@/assets/galeria-sofa-processo.webp";
import sofaResultado     from "@/assets/galeria-sofa-resultado.webp";
import sofaAntes         from "@/assets/galeria-sofa-antes.webp";

export const MATERIAL_HERO_FALLBACK = heroSofa;

export const MATERIAL_HERO: Record<string, string> = {
  "limpeza-sofa-tecido":      sofaProcesso,
  "limpeza-sofa-veludo":      sofaAntes,
  "limpeza-sofa-pele":        sofaResultado,
  "limpeza-sofa-microfibra":  heroSofa,
  "limpeza-sofa-linho":       heroSofa,
  "limpeza-sofa-camurca":     sofaAntes,
  "limpeza-sofa-sintetico":   heroSofa,
  "limpeza-tapete-la":        heroRug,
  "limpeza-tapete-persa":     heroRug,
  "limpeza-tapete-sintetico": heroCarpet,
  "limpeza-tapete-sisal":     heroCarpet,
};
