import { locationPrices } from '@/constants/travel';

export const normalizeCity = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function matchServiceCity(data: { countryCode?: string; city?: string; locality?: string; localityName?: string }) {
  if (data.countryCode !== 'PT') return undefined;
  // Never match a district: an unsupported town in Porto district is not Porto city.
  for (const candidate of [data.city, data.locality, data.localityName]) {
    if (!candidate) continue;
    const city = Object.keys(locationPrices).find(name => normalizeCity(name) === normalizeCity(candidate));
    if (city) return city;
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
