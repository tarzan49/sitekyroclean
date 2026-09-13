import CommercialHero from './CommercialHero';
import { WHATSAPP_BASE } from '@/constants/business';
import { buildServiceWaMessage } from '@/lib/whatsappMessages';
interface ServiceHeroProps { badge?: string; title: string; serviceSlug: string }
export default function ServiceHero({ title, serviceSlug }: ServiceHeroProps) {
  return <CommercialHero title={title} serviceSlug={serviceSlug} whatsappHref={`${WHATSAPP_BASE}?text=${encodeURIComponent(buildServiceWaMessage(serviceSlug))}`} source={`service_hero_${serviceSlug}`} />;
}
