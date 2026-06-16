import painpointSofaStain    from "@/assets/hero-p-manchas-vinho-sofa.webp";
import painpointSofaMites    from "@/assets/hero-p-acaros-sofa.webp";
import painpointSofaOdor     from "@/assets/hero-p-mau-cheiro-sofa.webp";
import painpointSofaWear     from "@/assets/hero-p-sofa-desgastado.webp";
import painpointColchaoMites from "@/assets/hero-p-acaros-colchao.webp";
import painpointColchaoStain from "@/assets/hero-p-manchas-colchao.webp";
import painpointColchaoOdor  from "@/assets/hero-p-mau-cheiro-colchao.webp";
import painpointColchaoAllergy from "@/assets/hero-p-alergias-colchao.webp";
import painpointTapeteDirt   from "@/assets/hero-p-limpeza-tapetes.webp";
import painpointTapeteStain  from "@/assets/hero-p-manchas-tapete.webp";
import painpointTapeteAllergens from "@/assets/hero-p-pelos-tapete.webp";
import painpointTapeteColor  from "@/assets/hero-p-tapete-persa.webp";
import painpointCadeiraDirt  from "@/assets/hero-p-limpeza-cadeiras.webp";
import painpointCadeiraStain from "@/assets/hero-p-mancha-tinta.webp";
import painpointCadeiraOdor  from "@/assets/hero-p-limpeza-puff.webp";
import painpointAlcatifaDirt from "@/assets/hero-p-limpeza-alcatifas.webp";
import painpointAlcatifaAllergens from "@/assets/hero-p-mofo-alcatifa.webp";
import painpointAlcatifaStain from "@/assets/alcatifa-cleaning.webp";
import painpointImperProtect from "@/assets/hero-waterproofing.webp";
import painpointImperStain   from "@/assets/hero-p-mancha-gordura-sofa.webp";
import painpointImperWear    from "@/assets/service-waterproof-new.webp";

export const PROBLEM_IMAGES: Record<string, string[]> = {
  "limpeza-sofas":     [painpointSofaStain, painpointSofaMites, painpointSofaOdor, painpointSofaWear],
  "limpeza-colchoes":  [painpointColchaoMites, painpointColchaoStain, painpointColchaoOdor, painpointColchaoAllergy],
  "limpeza-tapetes":   [painpointTapeteDirt, painpointTapeteStain, painpointTapeteAllergens, painpointTapeteColor],
  "limpeza-cadeiras":  [painpointCadeiraDirt, painpointCadeiraStain, painpointCadeiraOdor],
  "limpeza-alcatifas": [painpointAlcatifaDirt, painpointAlcatifaAllergens, painpointAlcatifaStain],
  "impermeabilizacao": [painpointImperProtect, painpointImperStain, painpointImperWear],
};

// CTA labels for LocationServicePage problem cards (keyed by locationSeoData problem titles)
export const PROBLEM_CTA: Record<string, string> = {
  "Manchas difíceis no sofá": "Remover Manchas",
  "Ácaros e bactérias invisíveis": "Eliminar Ácaros",
  "Odores desagradáveis": "Eliminar Odores",
  "Desgaste prematuro do tecido": "Proteger Tecido",
  "Ácaros no colchão": "Eliminar Ácaros",
  "Manchas de suor e líquidos": "Remover Manchas",
  "Odores acumulados": "Eliminar Odores",
  "Alergias noturnas": "Dormir Melhor",
  "Sujidade acumulada nas fibras": "Limpeza Profunda",
  "Manchas resistentes": "Remover Manchas",
  "Alergénios e ácaros": "Eliminar Ácaros",
  "Cores desbotadas": "Revitalizar Cores",
  "Sujidade do uso diário": "Limpeza Profunda",
  "Manchas visíveis": "Remover Manchas",
  "Odores retidos": "Eliminar Odores",
  "Sujidade profunda acumulada": "Limpeza Profunda",
  "Manchas em grandes superfícies": "Remover Manchas",
  "Sofá sem proteção": "Proteger Sofá",
  "Manchas frequentes com crianças e animais": "Prevenir Manchas",
  "Desgaste acelerado dos tecidos": "Prolongar Vida",
};

// CTA labels for FreguesiaServicePage problem cards (keyed by service-specific problem titles)
export const PROBLEM_POOL_CTA: Record<string, string> = {
  // limpeza-sofas
  "Manchas de café e vinho no tecido": "Remover Manchas",
  "Ácaros invisíveis nas fibras do sofá": "Eliminar Ácaros",
  "Odores de animais domésticos no sofá": "Eliminar Odores",
  "Sujidade profunda acumulada ao longo dos anos": "Limpeza Profunda",
  "Pêlos de animais entranhados no estofo": "Eliminar Pêlos",
  "Humidade e manchas de água no tecido": "Tratar Humidade",
  "Marcas de crianças e derrames no estofo": "Remover Manchas",
  "Tecido envelhecido e cores desbotadas": "Renovar Sofá",
  // limpeza-colchoes
  "Ácaros que causam alergias ao dormir": "Eliminar Ácaros",
  "Manchas de suor e líquidos no colchão": "Remover Manchas",
  "Odores acumulados ao longo dos anos": "Eliminar Odores",
  "Fungos e humidade em quartos pouco ventilados": "Tratar Humidade",
  "Pêlos de animais acumulados na cama": "Eliminar Pêlos",
  "Alergias e problemas respiratórios noturnos": "Dormir Melhor",
  "Manchas difíceis de acidentes e derrames": "Remover Manchas",
  "Colchão desgastado a precisar de higienização profunda": "Higienizar Colchão",
  // limpeza-tapetes
  "Sujidade profunda acumulada nas fibras": "Limpeza Profunda",
  "Manchas resistentes de bebidas e alimentos": "Remover Manchas",
  "Ácaros e alergénios escondidos nas fibras": "Eliminar Ácaros",
  "Pêlos de animais encrustados nas fibras": "Eliminar Pêlos",
  "Cores desbotadas e aspeto envelhecido": "Revitalizar Cores",
  "Odores de animais e humidade no tapete": "Eliminar Odores",
  "Sujidade de calçado e tráfego diário intenso": "Limpeza Profunda",
  "Tapetes delicados a precisar de cuidado especializado": "Cuidado Especial",
  // limpeza-cadeiras
  "Sujidade de uso diário nas cadeiras de refeição": "Limpeza Profunda",
  "Manchas de comida e bebidas no estofo": "Remover Manchas",
  "Odores de cozinha e uso diário retidos no tecido": "Eliminar Odores",
  "Pêlos de animais nas cadeiras estofadas": "Eliminar Pêlos",
  "Descoloração e desgaste nas zonas de contacto": "Renovar Cadeiras",
  "Cadeiras de escritório com anos de uso intenso": "Limpeza Profunda",
  "Bactérias em superfícies de contacto frequente": "Higienizar",
  "Cadeiras de qualidade a perder o aspeto original": "Renovar Cadeiras",
  // limpeza-alcatifas
  "Sujidade profunda em toda a extensão da alcatifa": "Limpeza Profunda",
  "Manchas difíceis nas zonas de maior passagem": "Remover Manchas",
  "Ácaros e alergénios em alcatifas de uso intenso": "Eliminar Ácaros",
  "Odores persistentes difíceis de eliminar em casa": "Eliminar Odores",
  "Humidade e risco de mofo em zonas expostas": "Tratar Humidade",
  "Pêlos de animais entranhados nas fibras densas": "Eliminar Pêlos",
  "Alcatifa de escritório com tráfego comercial intenso": "Limpeza Profunda",
  "Fibras compactadas e cores desbotadas": "Revitalizar Fibras",
  // impermeabilizacao
  "Sofá desprotegido contra derrames futuros": "Proteger Sofá",
  "Manchas frequentes em famílias com crianças": "Prevenir Manchas",
  "Acidentes de animais domésticos nos estofos": "Proteger Estofo",
  "Tecidos premium sem proteção adequada": "Proteger Tecido",
  "Custos repetidos com limpezas evitáveis": "Poupar Dinheiro",
  "Estofos novos sem proteção preventiva": "Proteger Estofo",
  "Humidade e líquidos que penetram rapidamente": "Impermeabilizar",
  "Desgaste acelerado por falta de tratamento preventivo": "Prolongar Vida",
};

export const PRICE_HEADING_VERB: Record<string, string> = {
  "limpeza-sofas":     "higienizar um sofá",
  "limpeza-colchoes":  "higienizar um colchão",
  "limpeza-tapetes":   "higienizar um tapete",
  "limpeza-cadeiras":  "higienizar uma cadeira",
  "limpeza-alcatifas": "higienizar uma alcatifa",
  "impermeabilizacao": "impermeabilizar um sofá",
};
