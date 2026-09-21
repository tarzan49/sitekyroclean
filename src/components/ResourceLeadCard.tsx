import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Star } from 'lucide-react';
import { REVIEW_RATING, REVIEW_COUNT } from '@/constants/business';
import { RESPONSE_PROMISE } from '@/constants/commercialPolicy';
import { getResourceOffer, getResourceWhatsapp, RESOURCE_TRAVEL } from '@/data/resourceContent';
import type { BlogPost } from '@/data/blogData';

export default function ResourceLeadCard({ post, compact = false }: { post?: BlogPost; compact?: boolean }) {
  const offer = getResourceOffer(post);
  return <aside aria-label="Pedir avaliação e orçamento" className={`bg-kyro-green text-white border-t-2 border-[#D4AF37] rounded-sm ${compact ? 'p-5' : 'p-6 sm:p-8'}`}>
    <p className="text-sm text-[#D4AF37] mb-3">Orçamento gratuito, sem compromisso</p>
    <h2 className="type-card-title mb-3">{offer.title}</h2>
    <p className="text-base leading-relaxed text-white/85 mb-5">{offer.detail}</p>
    <a href={getResourceWhatsapp(post)} target="_blank" rel="noopener noreferrer" data-tracking-source={post ? `blog-${post.slug}` : 'recursos'} className="flex min-h-[52px] items-center justify-center gap-2 rounded-sm bg-[#16833e] hover:bg-[#116b32] px-4 py-3 text-center font-semibold text-base">
      <MessageCircle className="h-5 w-5 shrink-0" />{offer.action}
    </a>
    <Link to={offer.href} className="flex min-h-11 items-center justify-center gap-2 py-2 underline underline-offset-4 text-base">{offer.link}<ArrowRight className="w-4 h-4 shrink-0" /></Link>
    <p className="text-sm leading-relaxed text-white/80 mt-2">{RESOURCE_TRAVEL}</p>
    <div className="mt-5 border-t border-white/20 pt-4 space-y-2 text-sm">
      <p className="flex gap-2 items-center"><Star className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />{REVIEW_RATING} · {REVIEW_COUNT}+ avaliações Google</p>
      <p>{RESPONSE_PROMISE}</p>
    </div>
  </aside>;
}
