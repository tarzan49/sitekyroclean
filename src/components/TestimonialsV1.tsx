import { PUBLISHED_REVIEWS } from '@/data/reviewsPool';
import CustomerReviews from './CustomerReviews';
import SectionHeader from './SectionHeader';

export default function Testimonials() {
  return <section className="py-14 md:py-20 bg-kyro-green overflow-hidden">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
      <SectionHeader overline="Avaliações reais" heading="O que dizem os nossos" goldWord="clientes" subtitle="Nas palavras de quem já nos recebeu em casa." light={false} />
      <CustomerReviews reviews={PUBLISHED_REVIEWS.map(r=>({name:r.name,text:r.text}))} />
    </div>
  </section>;
}
