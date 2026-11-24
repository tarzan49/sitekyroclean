/** Fotografia real esbatida no lado direito de um topo verde. A secção à volta leva `relative isolate overflow-hidden`. */
export default function HeroPhoto({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" width={800} height={600} fetchPriority="high" className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-4/5 object-cover opacity-40 [mask-image:linear-gradient(to_left,black_10%,transparent)] md:w-3/5 md:opacity-60" />;
}
