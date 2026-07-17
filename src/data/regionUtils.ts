// Admin-only regional grouping: splits the 3 operational areas (porto/lisboa/algarve,
// used for travel pricing and the public /areas-de-servico page) one level further —
// separates the Área Metropolitana do Porto (AMP, 17 municípios) from the two Norte
// cities that aren't actually part of AMP (Braga, Guimarães). Used only in the admin
// panel to browse Localidade×Serviço / Freguesia×Serviço / Variantes Keyword by region.
import { cities } from "./locationSeoData";
import { municipiosComFreguesias } from "./freguesiaSeoData";

export type AdminRegion = "amp" | "norte" | "lisboa" | "algarve";

export const ADMIN_REGIONS: AdminRegion[] = ["amp", "norte", "lisboa", "algarve"];

export const ADMIN_REGION_LABELS: Record<AdminRegion, string> = {
  amp: "Área Metropolitana do Porto",
  norte: "Norte (sem Porto)",
  lisboa: "Área Metropolitana de Lisboa",
  algarve: "Algarve",
};

const NORTE_NON_AMP = new Set(["braga", "guimaraes"]);

export function getAdminRegion(citySlug: string): AdminRegion | null {
  const city = cities.find(c => c.slug === citySlug);
  if (!city) return null;
  if (city.area === "porto") return NORTE_NON_AMP.has(citySlug) ? "norte" : "amp";
  return city.area as "lisboa" | "algarve";
}

/** Resolves a keyword-variant locationPart, which is either a bare city slug
 * ("faro") or a "{municipioSlug}-{freguesiaSlug}" combo ("loule-quarteira"). */
export function getRegionForLocationPart(locationPart: string): AdminRegion | null {
  const direct = getAdminRegion(locationPart);
  if (direct) return direct;
  for (const mun of municipiosComFreguesias) {
    if (locationPart.startsWith(`${mun.slug}-`)) {
      const fregSlug = locationPart.slice(mun.slug.length + 1);
      if (mun.freguesias.some(f => f.slug === fregSlug)) {
        return getAdminRegion(mun.slug);
      }
    }
  }
  return null;
}
