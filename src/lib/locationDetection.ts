import { locationPrices } from '@/constants/travel';
import { municipiosComFreguesias } from '@/data/freguesiaList';
import { freguesiaToMunicipio, normalizeCity, TOO_COMMON_PARISH_NAMES } from '@/lib/parishMunicipality';

export { normalizeCity, TOO_COMMON_PARISH_NAMES };

// "S. João da Madeira", "Sta. Maria da Feira": a abreviatura não contém o nome
// por extenso, por isso a pesquisa por substring nunca a encontrava.
const expandAbbreviations = (value: string) => normalizeCity(value)
  .replace(/(^|\s)s\.?\s+/g, '$1sao ')
  .replace(/(^|\s)sta\.?\s+/g, '$1santa ')
  .replace(/(^|\s)sto\.?\s+/g, '$1santo ');

const servedParishes = municipiosComFreguesias
  .filter(m => m.name in locationPrices)
  .flatMap(m => m.freguesias.map(f => ({ parish: f.name, city: m.name, key: normalizeCity(f.name) })));

export interface LocationOption { city: string; parish?: string }

/**
 * Pesquisa do passo de localidade. Quem vive na Comporta escreve "Comporta",
 * não "Alcácer do Sal": as freguesias e localidades dos concelhos servidos
 * também aparecem, e escolhê-las seleciona o concelho, que é o que tem taxa
 * de deslocação. As freguesias de um concelho que já apareceu não se repetem.
 */
export function searchServiceLocations(query: string, limit = 6): LocationOption[] {
  const q = expandAbbreviations(query);
  if (!q) return [];
  const municipalities = Object.keys(locationPrices).filter(city => normalizeCity(city).includes(q));
  const parishes = servedParishes.filter(p => p.key.includes(q) && !municipalities.includes(p.city));
  return [...municipalities.map(city => ({ city })), ...parishes.map(({ parish, city }) => ({ city, parish }))].slice(0, limit);
}

export function matchServiceCity(data: { countryCode?: string; city?: string; locality?: string; localityName?: string }) {
  if (data.countryCode !== 'PT') return undefined;
  // Never match a district: an unsupported town in Porto district is not Porto city.
  for (const candidate of [data.city, data.locality, data.localityName]) {
    if (!candidate) continue;
    const city = Object.keys(locationPrices).find(name => normalizeCity(name) === normalizeCity(candidate));
    if (city) return city;
    const municipio = freguesiaToMunicipio.get(normalizeCity(candidate));
    if (municipio) return municipio;
  }
}

/** City plus the place words the reverse geocoder gave (parish, town), for the small-order rule (travel.ts). */
export async function detectServiceLocation(signal: AbortSignal): Promise<{ city: string; place: string }> {
  if (!navigator.geolocation) throw new Error('Escreva a sua localidade abaixo e continuamos.');
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Sem problema. Escreva a sua localidade abaixo e continuamos.')), { timeout: 10000, maximumAge: 0, enableHighAccuracy: false });
  });
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const query = new URLSearchParams({ latitude: String(position.coords.latitude), longitude: String(position.coords.longitude), localityLanguage: 'pt' });
  // Client-side only, current device coordinates with browser consent. No coordinates are stored.
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`, { signal, referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Não conseguimos identificar a cidade. Escreva a sua localidade abaixo e continuamos.');
  const data = await response.json();
  const city = matchServiceCity(data);
  if (!city) throw new Error('Não identificámos uma localidade servida na sua posição. Pesquise onde pretende o serviço.');
  const place = [data.locality, data.city, data.localityName].filter((v): v is string => typeof v === 'string' && v !== '').join(', ');
  return { city, place };
}

export async function detectServiceCity(signal: AbortSignal): Promise<string> {
  return (await detectServiceLocation(signal)).city;
}
