// Faixa giratória em todos os ecrãs, telemóvel incluído (dono, 25 Nov: "da forma que já te tinha pedido"). Empresas com quem já trabalhámos (dono, 24 Nov). Só nomes confirmados por ele (COMMERCIAL_CLIENTS);
// sem ficheiro de logótipo, mostra-se o nome escrito, nunca um logótipo inventado.
import portoCruz from '@/assets/comercial/logo-espaco-porto-cruz.webp';
import mare from '@/assets/comercial/logo-mare-jose-avillez.webp';
import tucanos from '@/assets/comercial/logo-tucanos.webp';
import donLopo from '@/assets/comercial/logo-don-lopo.webp';
import boite from '@/assets/comercial/logo-boite-porto.webp';
import belouracar from '@/assets/comercial/logo-belouracar.webp';
import churrasco from '@/assets/comercial/logo-sabores-churrasco-premium.webp';
import movenpick from '@/assets/comercial/logo-movenpick.webp';
import rc from '@/assets/comercial/logo-rc-restaurante.webp';
import duello from '@/assets/comercial/logo-duello.webp';
import garden from '@/assets/comercial/logo-garden-balthazar.webp';
import lumiere from '@/assets/comercial/logo-lumiere.webp';
import alMare from '@/assets/comercial/logo-al-mare.webp';
import arcadia from '@/assets/comercial/logo-arcadia.webp';
import praiaDaLuz from '@/assets/comercial/logo-praia-da-luz.webp';
import palacio from '@/assets/comercial/logo-palacio-da-bolsa.webp';
import genki from '@/assets/comercial/logo-genki.webp';
import mikado from '@/assets/comercial/logo-mikado.webp';
import menina from '@/assets/comercial/logo-menina-colina.webp';
import realIndiana from '@/assets/comercial/logo-real-indiana.webp';
import { COMMERCIAL_CLIENTS } from '@/data/commercialSeoData';

const LOGOS: Record<string, string> = { 'Real Indiana': realIndiana, 'Arcádia': arcadia, 'Mikado': mikado, 'Palácio da Bolsa': palacio, 'Menina Colina': menina, 'Praia da Luz': praiaDaLuz, 'Al Mare': alMare, 'Genki': genki, 'Mövenpick': movenpick, 'RC Restaurante': rc, 'Duello': duello, 'Garden Balthazar': garden, 'Lumière': lumiere, 'Sabores do Churrasco Premium': churrasco, 'Espaço Porto Cruz': portoCruz, 'Maré José Avillez': mare, 'Tucanos': tucanos, 'Don Lopo': donLopo, 'Boîte Porto': boite, 'Belouracar': belouracar };

export default function ClientLogos() {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 items-center gap-14 pr-14 md:gap-24 md:pr-24">
      {COMMERCIAL_CLIENTS.map(name => (
        <li key={name} className="flex h-24 shrink-0 items-center">
          {LOGOS[name] ? <img src={LOGOS[name]} alt={name} width={150} height={88} className="h-[76px] w-auto max-w-[150px] object-contain md:h-[92px] md:max-w-[190px]" /> : <span className="font-playfair whitespace-nowrap text-2xl font-semibold text-[#3C3C3C] md:text-[28px]">{name}</span>}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="client-logos w-full overflow-hidden" style={{ maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)' }}>
      <style>{'@keyframes client-logos{to{transform:translateX(-50%)}}.client-logos>div{animation:client-logos 56s linear infinite}@media(prefers-reduced-motion:reduce){.client-logos{overflow-x:auto}.client-logos>div{animation:none}}'}</style>
      <div className="flex w-max">{row(false)}{row(true)}</div>
    </div>
  );
}
