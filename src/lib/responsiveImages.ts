/** Full-size source stays available in dialogs and for high-density screens. */
export function exampleImageSrcSet(src: string): string | undefined {
  if (!src.startsWith('/images/landing-problems/') || src.includes('/responsive/')) return undefined;
  const split = src.lastIndexOf('/');
  return `${src.slice(0, split)}/responsive${src.slice(split)} 600w, ${src} 1200w`;
}
export const EXAMPLE_IMAGE_SIZES = '(max-width: 1023px) calc(50vw - 26px), 290px';
