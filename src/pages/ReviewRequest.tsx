import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, ExternalLink, MessageCircle } from "lucide-react";
import { GoogleG } from "@/components/icons/GoogleG";
import { GOOGLE_REVIEW_URL } from "@/constants/google";
import { WHATSAPP_BASE } from "@/constants/business";
import { cityPrep } from "@/data/serviceCatalog";
import { REVIEW_ASK, REVIEW_BUTTON, REVIEW_H1, REVIEW_WHATSAPP } from "@/data/supportPages";
import { buildLocalBusinessNode, clearPrerenderedSchema } from "@/lib/seoSchema";

/** A peça com o artigo certo: "das suas cadeiras", não "o seu cadeiras". */
const serviceLabels: Record<string, string> = {
  sofa: "do seu sofá",
  colchao: "do seu colchão",
  tapete: "do seu tapete",
  cadeiras: "das suas cadeiras",
  alcatifa: "da sua alcatifa",
  impermeabilizacao: "da sua impermeabilização",
};

const ReviewRequest = () => {
  useEffect(() => {
    clearPrerenderedSchema();
  }, []);

  // Só se diz o nome, a peça e a cidade que o endereço trouxer: sem eles não se inventa "Cliente" nem "sofá em Porto".
  const [params] = useSearchParams();
  const nome = params.get("nome")?.trim();
  const cidade = params.get("cidade")?.trim();
  const servico = serviceLabels[params.get("servico") ?? ""];
  const thanks = servico ? `Foi um prazer tratar ${servico}${cidade ? ` ${cityPrep(cidade)} ${cidade}` : ""}. ` : "";
  const h1 = REVIEW_H1.split(" ");

  const schema = {
    "@context": "https://schema.org",
    ...buildLocalBusinessNode(),
  };

  return (
    <main className="bg-kyro-green text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* Uma secção só, com o botão de WhatsApp dentro: a barra fixa esconde-se e não tapa o fim do texto. */}
      <section className="mx-auto flex min-h-svh w-full max-w-xl flex-col px-5 pb-8">
        <header className="flex h-14 shrink-0 items-center justify-center border-b border-white/10 lg:h-20">
          <Link to="/" aria-label="Kyro Clean Solutions, página inicial" className="inline-flex min-h-11 items-center whitespace-nowrap font-playfair text-[17px] font-bold tracking-[-0.03em] text-white lg:text-[21px]"><span className="text-[#D4AF37]">KYRO</span>&nbsp;Clean Solutions</Link>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <h1 className="font-playfair text-[32px] font-semibold leading-tight text-white [overflow-wrap:anywhere] md:text-5xl">
            {nome ? <>Obrigado, <em className="not-italic text-[#D4AF37]">{nome}</em></> : <>{h1.slice(0, -1).join(" ")} <em className="not-italic text-[#D4AF37]">{h1.slice(-1)}</em></>}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">{thanks}{REVIEW_ASK}</p>

          <div className="mt-8 flex items-center justify-center gap-1.5" aria-hidden="true">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-8 w-8 fill-[#D4AF37] text-[#D4AF37]" />)}
          </div>

          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 text-base font-bold text-[#111111] transition-colors hover:bg-white/90">
            <GoogleG className="h-5 w-5 shrink-0" />{REVIEW_BUTTON}<ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
          </a>
          <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 text-base text-white/85 transition-colors hover:bg-white/5">
            <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />{REVIEW_WHATSAPP}
          </a>
        </div>
      </section>
    </main>
  );
};

export default ReviewRequest;
