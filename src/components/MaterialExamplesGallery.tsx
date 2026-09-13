import VisualExamplesGallery from "@/components/VisualExamplesGallery";
import { MATERIAL_EXAMPLES } from "@/data/materialExamples";

export default function MaterialExamplesGallery({ materialSlug }: { materialSlug: string }) {
  const gallery = MATERIAL_EXAMPLES[materialSlug];
  if (!gallery) return null;
  return <VisualExamplesGallery name={gallery.name} examples={gallery.examples.map((example, index) => ({
    ...example,
    src: gallery.image,
    imageStyle: { width: "200%", height: "200%", left: `-${(index % 2) * 100}%`, top: `-${Math.floor(index / 2) * 100}%` },
  }))} />;
}
