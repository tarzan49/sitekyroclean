import { locationPrices } from '@/constants/travel';
import { municipiosComFreguesias } from '@/data/freguesiaSeoData';

export const normalizeCity = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// BigDataCloud's `city`/`locality` fields often resolve to the civil parish
// (freguesia) the coordinates fall in, not the municipality \u2014 e.g. someone
// standing in Ramalde gets `city: "Ramalde"` back, which never matches
// locationPrices (keyed by municipality). Built once at module load, not
// per call: freguesia name -> municipality name, only for freguesias whose
// municipality is an actually served/priced city.
const freguesiaToMunicipio = new Map<string, string>();
for (const m of municipiosComFreguesias) {
  if (!(m.name in locationPrices)) continue;
  for (const f of m.freguesias) freguesiaToMunicipio.set(normalizeCity(f.name), m.name);
}

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

export async function detectServiceCity(signal: AbortSignal): Promise<string> {
  if (!navigator.geolocation) throw new Error('Escreva a sua localidade abaixo e continuamos.');
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Sem problema. Escreva a sua localidade abaixo e continuamos.')), { timeout: 10000, maximumAge: 0, enableHighAccuracy: false });
  });
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const query = new URLSearchParams({ latitude: String(position.coords.latitude), longitude: String(position.coords.longitude), localityLanguage: 'pt' });
  // Client-side only, current device coordinates with browser consent. No coordinates are stored.
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`, { signal, referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Não conseguimos identificar a cidade. Escreva a sua localidade abaixo e continuamos.');
  const city = matchServiceCity(await response.json());
  if (!city) throw new Error('Não identificámos uma localidade servida na sua posição. Pesquise onde pretende o serviço.');
  return city;
}
