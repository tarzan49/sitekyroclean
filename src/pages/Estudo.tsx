import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizButton from "@/components/QuizButton";
import { SITE_URL } from "@/constants/business";
import { DEFAULT_AUTHOR } from "@/data/authors";
import { buildStudySchemas } from "@/lib/seoSchema";
import {
  STUDY_ROUTE,
  STUDY_TITLE,
  STUDY_H1,
  STUDY_META_DESCRIPTION,
  STUDY_INTRO,
  STUDY_METHOD_POINTS,
  STUDY_LIMIT_POINTS,
  STUDY_PERIOD,
  STUDY_RUN_ON,
  STUDY_TOTAL_REQUESTS,
  buildStudyTables,
  formatStudyDate,
  studyPeriodDays,
  type StudyTable,
} from "@/data/studyData";

const PAGE_URL = `${SITE_URL}${STUDY_ROUTE}`;

/**
 * Página de estudo com dados próprios.
 *
 * Existe porque as páginas geradas deste site descrevem um serviço que
 * qualquer concorrente também descreve. Os pedidos que passaram por aqui não.
 *
 * Toda a cópia e todas as tabelas vêm de src/data/studyData.ts, partilhadas
 * com o scripts/prerender.ts: o que a pessoa lê e o que um motor lê é o mesmo
 * texto, renderizado de duas maneiras.
 */
const Estudo = () => {
  const tables = buildStudyTables();

  useEffect(() => {
    document.title = STUDY_TITLE;
    document.querySelector('meta[name="description"]')?.setAttribute("content", STUDY_META_DESCRIPTION);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", PAGE_URL);
  }, []);

  return (
    <>
      {buildStudySchemas({
        url: PAGE_URL,
        name: STUDY_H1,
        description: STUDY_META_DESCRIPTION,
        temporalCoverage: `${STUDY_PERIOD.start}/${STUDY_PERIOD.end}`,
        size: STUDY_TOTAL_REQUESTS,
        variables: tables.map(table => table.heading),
        datePublished: STUDY_RUN_ON,
        authorSlug: DEFAULT_AUTHOR.slug,
      }).map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-[#f4f5f7]">
        <Header />

        <div data-mobile-hero="text" className="pt-24 pb-10 bg-checker-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center gap-1.5 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-gold transition-colors">Início</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80">Estudo</span>
            </nav>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-gold" />
              </div>
              <p className="text-gold text-sm font-bold tracking-[0.08em] uppercase">Dados próprios</p>
            </div>

            <h1 className="type-page-title font-playfair text-white mb-4">{STUDY_H1}</h1>

            <p className="text-white/60 text-sm mb-4">
              Por{" "}
              <Link to={`/autor/${DEFAULT_AUTHOR.slug}`} className="underline underline-offset-4 hover:text-gold">
                {DEFAULT_AUTHOR.name}
              </Link>
              {" · "}
              <time dateTime={STUDY_RUN_ON}>{formatStudyDate(STUDY_RUN_ON)}</time>
            </p>

            <p className="text-white/80 text-base leading-relaxed max-w-2xl">{STUDY_INTRO}</p>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-2">Método</h2>
            <p className="text-neutral-700 leading-relaxed mb-5">
              Está primeiro, e não no fim, porque um número sem método não é verificável.
              Quem quiser contestar qualquer valor desta página precisa de saber isto antes de o ler.
            </p>
            <ul className="grid gap-3">
              {STUDY_METHOD_POINTS.map(point => (
                <li key={point} className="bg-white border border-neutral-200 rounded-xl p-4 text-sm text-neutral-700 leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {tables.map(table => (
            <StudySection key={table.id} table={table} />
          ))}

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-2">O que estes números não dizem</h2>
            <p className="text-neutral-700 leading-relaxed mb-5">
              Um estudo que só diz aquilo que lhe convém não serve para ser citado.
              Estes são os limites reais destes dados.
            </p>
            <ul className="grid gap-3">
              {STUDY_LIMIT_POINTS.map(point => (
                <li key={point} className="bg-white border border-neutral-200 rounded-xl p-4 text-sm text-neutral-700 leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-playfair text-2xl sm:text-3xl mb-4">Usar estes dados</h2>
            <p className="text-neutral-700 leading-relaxed">
              Os números desta página podem ser citados com atribuição à Kyro Clean Solutions,
              indicando o período ({formatStudyDate(STUDY_PERIOD.start)} a {formatStudyDate(STUDY_PERIOD.end)},
              {" "}{studyPeriodDays()} dias) e o número de pedidos ({STUDY_TOTAL_REQUESTS}).
              Se algum valor for atualizado, a data desta página muda com ele.{" "}
              <Link to={`/autor/${DEFAULT_AUTHOR.slug}`} className="underline underline-offset-4 hover:text-gold">
                Como escrevemos o que está aqui
              </Link>
              {" · "}
              <Link to="/sobre" className="underline underline-offset-4 hover:text-gold">
                Sobre a empresa
              </Link>
            </p>
          </section>

          <QuizButton ctaLabel="Pedir orçamento" />
        </main>

        <Footer />
      </div>
    </>
  );
};

/**
 * Uma secção com a sua tabela. A tabela leva `<caption>` e cabeçalhos de linha
 * e de coluna: uma tabela arrancada desta página tem de continuar a dizer do
 * que é que fala. Em ecrã estreito rola na horizontal em vez de encolher a
 * letra até deixar de se ler.
 */
const StudySection = ({ table }: { table: StudyTable }) => (
  <section className="mb-12">
    <h2 className="font-playfair text-2xl sm:text-3xl mb-4">{table.heading}</h2>

    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[420px] bg-white border border-neutral-200 rounded-xl overflow-hidden text-sm">
        <caption className="sr-only">{table.heading}</caption>
        <thead>
          <tr className="bg-neutral-50">
            {table.columns.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={`p-3 font-semibold text-neutral-600 border-b border-neutral-200 ${index === 0 ? "text-left" : "text-right"}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map(row => (
            <tr key={row[0]} className="border-b border-neutral-100 last:border-0">
              {row.map((cell, index) =>
                index === 0 ? (
                  <th key={index} scope="row" className="p-3 text-left font-medium text-neutral-800">
                    {cell}
                  </th>
                ) : (
                  <td key={index} className="p-3 text-right tabular-nums text-neutral-700">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <p className="text-sm text-neutral-600 leading-relaxed mt-4">{table.note}</p>
  </section>
);

export default Estudo;
