import { exampleImageSrcSet, EXAMPLE_IMAGE_SIZES } from '@/lib/responsiveImages';
import "@/styles/visual-examples.css";
import { useRef, useState } from "react";
import { ZoomIn, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import * as Dialog from "@radix-ui/react-dialog";
import type { CSSProperties } from "react";

export interface VisualExample { label: string; alt: string; src: string; thumbnailSrc?: string; thumbnailSrcSet?: string; thumbnailSizes?: string; imageStyle?: CSSProperties; id?: string; description?: string }

export default function VisualExamplesGallery({ examples, name, overline = "Material", heading = "Veja exemplos de", id = "material", imageDescription, onEnquire, variant = "light" }: { variant?: "light" | "dark"; examples: VisualExample[]; name: string; overline?: string; heading?: string; id?: string; imageDescription?: string; onEnquire?: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const photo = (index: number, loading: "lazy" | "eager" = "lazy") => (
    <div className="relative aspect-square overflow-hidden bg-[#173629]">
      <img
        src={loading === "lazy" ? examples[index].thumbnailSrc ?? examples[index].src : examples[index].src}
        srcSet={loading === "lazy" ? examples[index].thumbnailSrcSet ?? exampleImageSrcSet(examples[index].src) : undefined}
        sizes={loading === "lazy" ? examples[index].thumbnailSizes ?? EXAMPLE_IMAGE_SIZES : undefined}
        fetchpriority={loading === "lazy" ? "low" : "auto"}
        alt={examples[index].alt}
        loading={loading}
        decoding="async"
        width={400}
        height={400}
        className="absolute w-full h-full object-cover !max-w-none"
        style={examples[index].imageStyle}
      />
    </div>
  );

  return (
    <section data-visual-gallery id={id} className={`scroll-mt-24 py-14 md:py-20 ${variant === "dark" ? "bg-kyro-green" : "bg-[#FDFDF9]"}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <SectionHeader overline={overline} heading={heading} goldWord={name} light={variant === "light"} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {examples.map((example, index) => (
            <figure data-problem-id={example.id} key={example.label} className="min-w-0">
              <button
                type="button"
                onClick={event => { opener.current = event.currentTarget; setSelected(index); }}
                aria-label={`Ampliar imagem: ${example.label}`}
                className="group relative block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
              >
                {photo(index)}
                <span aria-hidden="true" className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#071a12]/75 text-white group-hover:bg-[#071a12]">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </button>
              <figcaption className={`pt-3 text-sm sm:text-base leading-snug ${variant === "dark" ? "text-white/90" : "text-[#173629]"}`}>{example.label}</figcaption>
            </figure>
          ))}
        </div>
        <p className={`mt-5 text-xs leading-relaxed ${variant === "dark" ? "text-white/70" : "text-[#536259]"}`}>Imagens ilustrativas. Toque para ampliar.</p>
        <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
          <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/75" />
          <Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }} className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-white/15 bg-[#071a12] p-4 text-white shadow-2xl">
            {selected !== null && <>
              <Dialog.Title className="pr-10 pb-4 text-lg">{examples[selected].label}</Dialog.Title>
              {photo(selected, "eager")}
              <Dialog.Description className="pt-3 text-sm text-white/65">{examples[selected].description ?? imageDescription ?? "Imagem ilustrativa."}</Dialog.Description>
              {onEnquire && <button type="button" onClick={() => { setSelected(null); onEnquire(); }} aria-label={`Pedir avaliação: ${examples[selected].label}`} className="mt-4 min-h-12 w-full bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#071a12]">Pedir avaliação</button>}
            </>}
            <Dialog.Close asChild><button type="button" aria-label="Fechar imagem" className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-white focus-visible:outline focus-visible:outline-[#D4AF37]"><X className="h-5 w-5" /></button></Dialog.Close>
          </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>
  );
}
