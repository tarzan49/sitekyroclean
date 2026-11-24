import { useEffect } from 'react';

/** Liga as secções de ecrã inteiro com encaixe (`html.snap-sections`) enquanto a página estiver aberta.
 *  Novo modelo do dono (24 Nov): só se liga num modelo de página depois de ele estar compactado. */
export function useSnapSections(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('snap-sections');
    return () => document.documentElement.classList.remove('snap-sections');
  }, [enabled]);
}
