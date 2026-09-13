// Conteúdo por cidade das páginas problema × cidade, partilhado pelo React e
// pelo prerender.
//
// Porque existe: as 1.154 páginas desta família repetiam 94% do texto entre si.
// Para as 26 cidades de um mesmo problema, o HTML gerado era literalmente
// idêntico tirando o nome da cidade — mesmos exemplos, mesmos passos, mesmos
// benefícios e exatamente as mesmas quatro perguntas. É o padrão que o Google
// lê como páginas-porta, e o castigo costuma atingir a confiança do domínio
// inteiro e não só estas páginas.
//
// A família de localidade × serviço, construída no mesmo sítio, está nos 0,41
// porque usa três mecanismos que esta não usava. Aqui aplicam-se os mesmos, com
// dados que já existem e que são verdadeiros: nada é inventado por cidade.
//
// Duas notas de correção que este módulo também resolve:
//   - As avaliações já variavam por cidade no React, mas não existiam no HTML
//     pré-renderizado. Google e visitante viam páginas diferentes.
//   - As FAQ eram iguais nas duas superfícies, mas iguais em todas as cidades.
import { getLandingFaqs, type LandingService } from './landingFaqPool';
import { pickReviewSubset } from './reviewsPool';
import { locationPrices } from '../constants/travel';
import { cityPrep } from './serviceCatalog';
import type { ProblemPage } from './problemSeoData';

const LANDING_SERVICES = new Set<string>([
  'limpeza-sofas', 'limpeza-colchoes', 'limpeza-tapetes',
  'limpeza-cadeiras', 'limpeza-alcatifas', 'impermeabilizacao',
]);

/** O serviço da família de landing a que este problema pertence. */
export function problemLandingService(problem: ProblemPage): LandingService {
  const found = problem.relatedServices.find(slug => LANDING_SERVICES.has(slug));
  return (found ?? 'limpeza-sofas') as LandingService;
}

/**
 * Quatro perguntas escolhidas pela identidade da página, da mesma biblioteca de
 * 180 que as outras famílias usam. A escolha é estável por URL: a mesma cidade
 * devolve sempre as mesmas perguntas, no React e no HTML.
 */
export function getProblemCityFaqs(problem: ProblemPage, cityName: string, path: string) {
  return getLandingFaqs({
    serviceSlug: problemLandingService(problem),
    pageKey: path,
    municipality: cityName,
    // Uma página de problema numa cidade é, para efeitos de seleção, uma página
    // de localidade: mesma intenção e mesma resposta sobre deslocação e visita.
    family: 'localidade',
  });
}

/** Seis avaliações da região da cidade. Mesma semente que o React já usava. */
export function getProblemCityReviews(problem: ProblemPage, citySlug: string) {
  return pickReviewSubset(problemLandingService(problem), `${problem.slug}-${citySlug}`, 6);
}

/**
 * Uma frase de cobertura com a taxa real daquela cidade. É o dado mais honesto
 * que distingue uma cidade da seguinte, porque varia mesmo: 10, 15 ou 20 euros.
 */
export function getProblemCityCoverage(cityName: string): string {
  const fee = locationPrices[cityName];
  const prep = cityPrep(cityName);
  const travel = fee === undefined
    ? 'Deslocação confirmada antes da marcação.'
    : `Deslocação ${prep} ${cityName}: +${fee}€.`;
  return `Serviço ao domicílio ${prep} ${cityName} e arredores. ${travel} Orçamento gratuito e sem compromisso, confirmado antes da marcação.`;
}
