import { getTreatmentRoutes, getExpansionRoutes } from './treatmentSeoData';
import { getAllLocationRoutes } from "./locationSeoData";
import { getAllFreguesiaRoutes } from "./freguesiaSeoData";
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from "./materialSeoData";
import { getAllPriceRoutes } from "./priceSeoData";
import { getAllProblemCityRoutes } from "./problemCitySeoData";
import { getAllKeywordVariantRoutes } from "./keywordVariantRouteData";
import { getAllPackComboRoutes } from "./packComboData";
import { getAllMarcaSofaRoutes } from "./marcaSofaData";
import { getAllMarcaColchaoRoutes } from "./marcaColchaoData";
import { getAllMarcaCadeirasRoutes } from "./marcaCadeirasData";
import { getAllCommercialRoutes } from "./commercialSeoData";
// Build the exact inventory once, in this deferred chunk. First match wins,
// preserving the previous router precedence without rendering thousands of Routes.
const locationRoutes = getAllLocationRoutes();
const frequesiaRoutes = getAllFreguesiaRoutes();
const materialRoutes = getAllMaterialRoutes();
const materialCityRoutes = getAllMaterialCityRoutes();
const priceRoutes = getAllPriceRoutes();
const problemCityRoutes = getAllProblemCityRoutes();
const keywordVariantRoutes = getAllKeywordVariantRoutes();
const packComboRoutes = getAllPackComboRoutes();
const marcaSofaRoutes = getAllMarcaSofaRoutes();
const marcaColchaoRoutes = getAllMarcaColchaoRoutes();
const marcaCadeirasRoutes = getAllMarcaCadeirasRoutes();
const commercialRoutes = getAllCommercialRoutes();


const routeComponents = new Map<string, string>();
for (const route of locationRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "LocationServicePage");
for (const route of frequesiaRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "FreguesiaServicePage");
for (const route of keywordVariantRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "SofaVariantPage");
for (const route of problemCityRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "ProblemCityPage");
for (const route of commercialRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "CommercialPage");
for (const route of marcaSofaRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "MarcaSofaPage");
for (const route of marcaColchaoRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "MarcaColchaoPage");
for (const route of marcaCadeirasRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "MarcaCadeirasPage");
for (const route of materialRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "MaterialPage");
for (const route of materialCityRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "MaterialPage");
for (const route of priceRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "PricePage");
for (const route of packComboRoutes) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "PackComboPage");
for (const route of [...getTreatmentRoutes(), ...getExpansionRoutes()]) if (!routeComponents.has(route.path.toLowerCase())) routeComponents.set(route.path.toLowerCase(), "TreatmentPage");

export function generatedPageForPath(pathname: string): string {
  let path = pathname;
  try { path = decodeURI(path); } catch { return "NotFound"; }
  return routeComponents.get(path.replace(/\/+$/, "").toLowerCase()) ?? "NotFound";
}
