import { PUBLISHED_REVIEWS } from '@/data/reviewsPool';
import CustomerReviews from './CustomerReviews';
import SectionHeader from './SectionHeader';

export default function Testimonials() {
  return <section id="avaliacoes" className="py-14 md:py-20 bg-[#FDFDF9] overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Avaliações reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." />
      <CustomerReviews reviews={PUBLISHED_REVIEWS.filter(r=>r.rating===5)} />
    </div>
  </section>;
}
