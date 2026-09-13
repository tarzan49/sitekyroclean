import { pickReviewSubset } from '@/data/reviewsPool';
import { useLocation } from 'react-router-dom';
import CustomerReviews from './CustomerReviews';

interface Props { serviceSlug: string; seed: string; heading?: string }

export default function ServiceReviewsGrid({serviceSlug,seed,heading='Avaliações reais'}:Props) {
  const {pathname}=useLocation();
  const reviews=pickReviewSubset(serviceSlug,`${pathname}:${seed}`,6);
  return <div>{heading&&<p className="text-sm font-bold tracking-[0.08em] uppercase text-gold mb-6">{heading}</p>}<CustomerReviews reviews={reviews} /></div>;
}
