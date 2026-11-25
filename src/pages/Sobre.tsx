import { useSnapSections } from "@/hooks/useSnapSections";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Phone, Mail, Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import {
  SITE_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  BUSINESS_EMAIL,
  BUSINESS_EMAIL_HREF,
  REVIEW_RATING,
  REVIEW_COUNT,
  CLIENTS_SERVED_LABEL,
  SERVICES_COMPLETED_LABEL,
} from "@/constants/business";
import { services, cities } from "@/data/serviceCatalog";
import { isPricedPerChair, startingPriceLabel } from "@/data/enginePrices";
import { locationPrices } from "@/constants/travel";
import {
  RESPONSE_PROMISE,
  DRYING_PROMISE,
  SATISFACTION_PROMISE,
  PRICE_PROMISE,
  AVAILABILITY_PROMISE,
  COVERAGE_PROMISE,
  WEEKLY_REQUESTS,
  TREATMENT_EXTRAS,
} from "@/constants/commercialPolicy";
import { buildAboutPageSchema } from "@/lib/seoSchema";

const PAGE_URL = `${SITE_URL}/sobre`;

/**
 * Página de entidade.
 *
 * Existe para que uma pessoa, ou um motor generativo, consiga responder a
 * "quem é a Kyro Clean Solutions" sem ter de juntar pedaços de 16.000 páginas
 * de serviço. Todos os números e compromissos são importados das constantes
 * que o resto do site já usa: nada aqui é escrito à mão, por isso nada aqui
 * pode contradizer uma página de serviço nem ficar para trás quando um valor
 * mudar na fonte.
 */
const Sobre = () => {
  useSnapSections(true);
  const travelFees = Object.values(locationPrices);
  const travelMin = Math.min(...travelFees);
  const travelMax = Math.max(...travelFees);

  useEffect(() => {
    document.title = "Sobre a Kyro Clean Solutions | Limpeza de Estofos ao Domicílio";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      `Quem somos, onde trabalhamos e como trabalhamos. Limpeza de estofos ao domicílio em ${cities.length} cidades, com equipas próprias no Porto, Braga, Lisboa e Algarve.`);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
  }, []);

  // Modelo novo (dono, 24 Nov): secções de ecrã inteiro com encaixe, um título por secção, o mesmo texto de antes.
  const gold = (t: string, w: string) => <>{t} <em className="not-italic" style={{ color: "#D4AF37" }}>{w}</em></>;
  const stats = [
    [REVIEW_RATING, `Média de ${REVIEW_COUNT} avaliações no Google`],
    [CLIENTS_SERVED_LABEL, "Clientes servidos"],
    [SERVICES_COMPLETED_LABEL, "Serviços realizados"],
    [String(cities.length), "Cidades atendidas"],
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAboutPageSchema()) }} />
      <Header />
      <main>
        <section data-commercial-hero className="flex min-h-[var(--app-h,100svh)] items-end bg-kyro-green text-white">
          <div className="mx-auto w-full max-w-4xl px-5 pb-10 pt-24 sm:px-6">
            <nav className="mb-4 hidden items-center gap-1.5 text-sm text-white/70 md:flex" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-[#D4AF37]">Início</Link><ChevronRight className="h-3 w-3" /><span>Sobre</span>
            </nav>
            <h1 className="font-playfair mb-3 text-[28px] font-semibold leading-tight text-white md:text-5xl">Sobre a Kyro Clean <em className="not-italic text-[#D4AF37]">Solutions</em></h1>
            <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-white/80 md:text-lg">
              Somos uma empresa portuguesa de limpeza e higienização de estofos ao domicílio.
              Levamos o equipamento a casa do cliente e tratamos sofás, colchões, tapetes,
              cadeiras e alcatifas no local, em {cities.length} cidades.
            </p>
            <ul className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
              {stats.map(([n, label]) => <li key={label} className="bg-[#0c241a] p-3.5"><span className="block text-2xl font-semibold text-[#D4AF37]">{n}</span><span className="text-xs leading-snug text-white/70">{label}</span></li>)}
            </ul>
            <p className="text-xs text-white/60">{WEEKLY_REQUESTS}</p>
          </div>
        </section>

        <section id="servicos" className="bg-[#FDFDF9] py-14">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <div className="mb-8"><h2 className="type-section-title font-playfair text-[#111111]">{gold("O que", "fazemos")}</h2></div>
            <p className="mb-3 text-[13px] leading-snug text-[#505650]">
              Seis serviços, todos ao domicílio. Os preços indicados são de partida, por artigo,
              e a deslocação é cobrada à parte, entre {travelMin}€ e {travelMax}€ conforme a cidade.
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {services.map(service => (
                <li key={service.slug} className="rounded-xl border border-[#E5E0D3] bg-white px-3 py-2.5">
                  <Link to={service.baseRoute} className="text-[15px] font-semibold text-[#111111] hover:text-[#D4AF37]">{service.name}</Link>
                  <p className="mt-0.5 text-xs leading-snug text-[#505650]">
                    {/\/m²/.test(service.priceFrom)
                      ? service.priceFrom
                      : isPricedPerChair(service.slug)
                        ? startingPriceLabel(service.slug, service.priceFrom)
                        : `${startingPriceLabel(service.slug, service.priceFrom)} por artigo`}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[#505650]">{TREATMENT_EXTRAS}</p>
          </div>
        </section>

        <section id="como" className="bg-kyro-green py-14 text-white">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <div className="mb-8"><h2 className="type-section-title font-playfair text-white">{gold("Onde e como", "trabalhamos")}</h2></div>
            <div className="space-y-4 text-[16.5px] leading-relaxed text-white/85 md:space-y-2.5 md:text-[14px] md:leading-snug">
              <p>{COVERAGE_PROMISE}</p>
              <p>Ao todo são {cities.length} cidades com página própria por serviço. A lista completa, incluindo freguesias, está em <Link to="/areas-de-servico" className="underline underline-offset-4 hover:text-[#D4AF37]">áreas de serviço</Link>.</p>
              <p>O orçamento é pedido por WhatsApp, telefone ou pelo simulador do site. {RESPONSE_PROMISE}.</p>
              <p>{AVAILABILITY_PROMISE}</p>
              <p>{DRYING_PROMISE}</p>
            </div>
          </div>
        </section>

        <section id="compromissos" className="bg-[#FDFDF9] py-14">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <div className="mb-8"><h2 className="type-section-title font-playfair text-[#111111]">{gold("Os nossos", "compromissos")}</h2></div>
            <dl className="space-y-3">
              <div className="rounded-xl border border-[#E5E0D3] bg-white p-4" style={{ borderTop: "3px solid #D4AF37" }}>
                <dt className="mb-1 font-semibold">Preço confirmado antes da marcação</dt>
                <dd className="text-sm leading-relaxed text-[#505650]">{PRICE_PROMISE}</dd>
              </div>
              <div className="rounded-xl border border-[#E5E0D3] bg-white p-4" style={{ borderTop: "3px solid #D4AF37" }}>
                <dt className="mb-1 font-semibold">Repetição sem custos em 48 horas</dt>
                <dd className="text-sm leading-relaxed text-[#505650]">{SATISFACTION_PROMISE}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="contactos" className="bg-kyro-green py-14 text-white">
          <div className="mx-auto max-w-4xl px-5 sm:px-6">
            <div className="mb-8"><h2 className="type-section-title font-playfair text-white">{gold("Fale", "connosco")}</h2></div>
            <ul className="mb-6 space-y-3 text-[15px] text-white/85">
              <li className="flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-[#D4AF37]" /><span>Rua de Ferreira Cardoso 174, 4300-197 Porto</span></li>
              <li className="flex items-start gap-3"><Phone className="mt-1 h-4 w-4 shrink-0 text-[#D4AF37]" /><a href={`tel:${PHONE_TEL}`} className="hover:text-[#D4AF37]">{PHONE_DISPLAY}</a></li>
              <li className="flex items-start gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-[#D4AF37]" /><a href={BUSINESS_EMAIL_HREF} className="hover:text-[#D4AF37]">{BUSINESS_EMAIL}</a></li>
            </ul>
            <QuizButton ctaLabel="Pedir orçamento" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Sobre;
