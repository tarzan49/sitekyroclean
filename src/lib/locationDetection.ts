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
  if (!navigator.geolocation) throw new Error('Escolha a localidade do serviço abaixo.');
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Não foi possível obter a localização. Pode escolher a sua cidade.')), { timeout: 10000, maximumAge: 0, enableHighAccuracy: false });
  });
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  const query = new URLSearchParams({ latitude: String(position.coords.latitude), longitude: String(position.coords.longitude), localityLanguage: 'pt' });
  // Client-side only, current device coordinates with browser consent. No coordinates are stored.
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${query}`, { signal, referrerPolicy: 'no-referrer' });
  if (!response.ok) throw new Error('Não foi possível identificar a cidade. Escolha a localidade abaixo.');
  const city = matchServiceCity(await response.json());
  if (!city) throw new Error('Não identificámos uma localidade servida na sua posição. Pesquise onde pretende o serviço.');
  return city;
}
