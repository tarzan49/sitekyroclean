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
  const travelFees = Object.values(locationPrices);
  const travelMin = Math.min(...travelFees);
  const travelMax = Math.max(...travelFees);

  useEffect(() => {
    document.title = "Sobre a Kyro Clean Solutions | Limpeza de Estofos ao Domicílio";
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      `Quem somos, onde trabalhamos e como trabalhamos. Limpeza de estofos ao domicílio em ${cities.length} cidades, com equipas próprias no Porto, Braga, Lisboa e Algarve.`);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
  }, []);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAboutPageSchema()) }} />

      <div className="min-h-screen bg-[#f4f5f7]">
        <Header />

        <div data-mobile-hero="text" className="pt-24 pb-10 bg-checker-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">Sobre</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-gold" />
              </div>
              <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase">KYRO CLEAN SOLUTIONS</p>
            </div>

            <h1 className="type-page-title font-playfair text-white mb-4">
              Sobre a Kyro Clean Solutions
            </h1>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl">
              Somos uma empresa portuguesa de limpeza e higienização de estofos ao domicílio.
              Levamos o equipamento a casa do cliente e tratamos sofás, colchões, tapetes,
              cadeiras e alcatifas no local, em {cities.length} cidades.
            </p>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">O que fazemos</h2>
            <p className="text-neutral-700 leading-relaxed mb-5">
              Seis serviços, todos ao domicílio. Os preços indicados são de partida, por artigo,
              e a deslocação é cobrada à parte, entre {travelMin}€ e {travelMax}€ conforme a cidade.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {services.map(service => (
                <li key={service.slug} className="bg-white border border-neutral-200 rounded-xl p-4">
                  <Link to={service.baseRoute} className="font-semibold hover:text-gold transition-colors">
                    {service.name}
                  </Link>
                  <p className="text-sm text-neutral-600 mt-1">
                    {service.priceFrom === "Sob orçamento"
                      ? "Sob orçamento, conforme as medidas"
                      : `Desde ${service.priceFrom} por artigo`}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-neutral-600 mt-4">{TREATMENT_EXTRAS}</p>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Onde trabalhamos</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">{COVERAGE_PROMISE}</p>
            <p className="text-neutral-700 leading-relaxed">
              Ao todo são {cities.length} cidades com página própria por serviço.
              A lista completa, incluindo freguesias, está em{" "}
              <Link to="/areas-de-servico" className="underline underline-offset-4 hover:text-gold">
                áreas de serviço
              </Link>.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Como trabalhamos</h2>
            <p className="text-neutral-700 leading-relaxed mb-3">
              O orçamento é pedido por WhatsApp, telefone ou pelo simulador do site. {RESPONSE_PROMISE}.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-3">{AVAILABILITY_PROMISE}</p>
            <p className="text-neutral-700 leading-relaxed">{DRYING_PROMISE}</p>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Os nossos compromissos</h2>
            <dl className="space-y-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <dt className="font-semibold mb-1">Preço confirmado antes da marcação</dt>
                <dd className="text-sm text-neutral-700 leading-relaxed">{PRICE_PROMISE}</dd>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <dt className="font-semibold mb-1">Repetição sem custos em 48 horas</dt>
                <dd className="text-sm text-neutral-700 leading-relaxed">{SATISFACTION_PROMISE}</dd>
              </div>
            </dl>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Em números</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="bg-white border border-neutral-200 rounded-xl p-4">
                <span className="block text-2xl font-semibold text-gold">{REVIEW_RATING}</span>
                <span className="text-sm text-neutral-600">Média de {REVIEW_COUNT} avaliações no Google</span>
              </li>
              <li className="bg-white border border-neutral-200 rounded-xl p-4">
                <span className="block text-2xl font-semibold text-gold">{CLIENTS_SERVED_LABEL}</span>
                <span className="text-sm text-neutral-600">Clientes servidos</span>
              </li>
              <li className="bg-white border border-neutral-200 rounded-xl p-4">
                <span className="block text-2xl font-semibold text-gold">{SERVICES_COMPLETED_LABEL}</span>
                <span className="text-sm text-neutral-600">Serviços realizados</span>
              </li>
              <li className="bg-white border border-neutral-200 rounded-xl p-4">
                <span className="block text-2xl font-semibold text-gold">{cities.length}</span>
                <span className="text-sm text-neutral-600">Cidades atendidas</span>
              </li>
            </ul>
            <p className="text-sm text-neutral-600 mt-4">{WEEKLY_REQUESTS}</p>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Contactos</h2>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 shrink-0 text-gold" />
                <span>Rua de Ferreira Cardoso 174, 4300-197 Porto</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 shrink-0 text-gold" />
                <a href={`tel:${PHONE_TEL}`} className="hover:text-gold transition-colors">{PHONE_DISPLAY}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 shrink-0 text-gold" />
                <a href={BUSINESS_EMAIL_HREF} className="hover:text-gold transition-colors">{BUSINESS_EMAIL}</a>
              </li>
            </ul>
          </section>

          <QuizButton ctaLabel="Pedir orçamento" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Sobre;
