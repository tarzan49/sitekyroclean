// Resolve o modelo da landing page para os componentes de página das quatro
// famílias, com a mesma regra que `LandingServiceSections` já usa: na entrada
// normal, vinda da pesquisa, o modelo veio no HTML e não é preciso catálogo
// nenhum; só a navegação dentro do site paga a importação.
//
// Sem isto, cada família importa o seu catálogo só para montar o hero:
// 24,5 KB comprimidos nas cidades, 52 KB nas freguesias, 66 KB nas variantes,
// que são 8.364 das páginas.
import { useEffect, useState } from 'react';
import { bootstrapLandingModel } from '@/data/landingModelBootstrap';
import type { LandingPageModel } from '@/data/landingPageModel';

export type LandingModelState =
  | { status: 'ready'; model: LandingPageModel }
  | { status: 'loading' }
  | { status: 'missing' };

export function useLandingModel(pathname: string): LandingModelState {
  const fromHtml = bootstrapLandingModel(pathname);
  const [loaded, setLoaded] = useState<{ path: string; model: LandingPageModel | null } | null>(null);

  useEffect(() => {
    if (fromHtml) return;
    let current = true;
    void import('@/data/landingPageModel').then(({ getLandingPageModel }) => {
      if (current) setLoaded({ path: pathname, model: getLandingPageModel(pathname) });
    });
    return () => { current = false; };
  }, [pathname, fromHtml]);

  if (fromHtml) return { status: 'ready', model: fromHtml };
  if (loaded?.path !== pathname) return { status: 'loading' };
  return loaded.model ? { status: 'ready', model: loaded.model } : { status: 'missing' };
}
