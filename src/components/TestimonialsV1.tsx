import { PUBLISHED_REVIEWS, STAR_ONLY_REVIEWS } from '@/data/reviewsPool';
import CustomerReviews from './CustomerReviews';
import SectionHeader from './SectionHeader';

// Dono, 25 Nov: todas as do Google de 4 e 5 estrelas, as sem comentário no fim; nunca 1, 2 ou 3.
const REVIEWS = [...PUBLISHED_REVIEWS, ...STAR_ONLY_REVIEWS].filter(r => (r.rating ?? 0) >= 4);

export default function Testimonials() {
  return <section id="avaliacoes" className="py-14 md:py-20 bg-[#FDFDF9] overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Avaliações reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." />
      <CustomerReviews reviews={REVIEWS} />
    </div>
  </section>;
}
