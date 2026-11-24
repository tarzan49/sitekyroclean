import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { BEFORE_AFTER_POOL, categoryForServiceSlug } from '@/data/beforeAfterPool';

/** Um antes e depois (ou o vídeo da água, na impermeabilização) a meio do artigo, sempre o mesmo em cada guia. */
export default function ArticleProof({ serviceSlug, seed }: { serviceSlug: string; seed: string }) {
  const category = categoryForServiceSlug(serviceSlug);
  if (!category) return null;
  // sofa-13 fica de fora: o "antes" tem a marca de uma ferramenta de IA (25 Nov).
  const pool = BEFORE_AFTER_POOL[category].filter(item => category === 'impermeabilizacao' ? item.kind === 'video' : item.kind === 'pair' && !item.before.includes('sofa-13'));
  if (!pool.length) return null;
  const item = pool[[...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % Math.min(pool.length, 6)];
  return <figure aria-label={category === 'impermeabilizacao' ? 'Vídeo real de um trabalho' : 'Antes e depois de um trabalho real'} className="my-10 overflow-hidden rounded-xl bg-kyro-green">
    {item.kind === 'video'
      ? <video src={item.src} poster={item.poster} muted loop playsInline autoPlay preload="none" aria-label="Água derramada num tecido impermeabilizado escorre sem entrar" className="mx-auto aspect-[9/16] w-full max-w-[300px] object-cover" />
      : item.kind === 'pair' && <div className={category === 'cadeiras' ? 'mx-auto aspect-[3/4] max-w-[360px]' : 'aspect-[4/3]'}><BeforeAfterSlider beforeImage={item.before} afterImage={item.after} noFrame /></div>}
  </figure>;
}
