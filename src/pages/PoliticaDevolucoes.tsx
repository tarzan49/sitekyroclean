import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="font-playfair text-xl font-bold text-[#1A4E30] mb-3">{title}</h2>
    <div className="text-[#333] leading-relaxed space-y-3 text-[15px]">{children}</div>
  </section>
);

const PoliticaDevolucoes = () => (
  <>
    <Header />

    <main className="bg-[#FDFDF9] min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="pt-8 pb-6 border-b border-[#1A4E30]/10 mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-2">Kyro Clean Solutions</p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#1A1A2E] leading-tight">
            Política de Devoluções
          </h1>
          <p className="text-sm text-[#555] mt-3">Última atualização: junho de 2026</p>
        </div>

        <Section title="1. Natureza do serviço">
          <p>
            A Kyro Clean Solutions presta serviços de limpeza e higienização profissional de estofos. Por se tratar de um <strong>serviço e não de um produto físico</strong>, não se aplicam devoluções após a realização do serviço.
          </p>
        </Section>

        <Section title="2. Insatisfação com o resultado">
          <p>
            Caso não esteja satisfeito com o resultado da limpeza, entre em contacto connosco no <strong>prazo de 48 horas</strong> após a prestação do serviço. Analisaremos a situação individualmente e, sempre que o problema seja imputável à nossa intervenção, comprometemo-nos a encontrar a melhor solução, que poderá incluir uma nova intervenção sem custos adicionais.
          </p>
        </Section>

        <Section title="3. Situações não cobertas">
          <p>Não nos responsabilizamos por:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Danos ou manchas preexistentes não reportados antes do início do serviço;</li>
            <li>Resultados condicionados pelo estado de desgaste, idade ou tipo de material do estofo;</li>
            <li>Manchas consideradas permanentes (tinta, corantes industriais, etc.) que foram comunicadas como tal antes do serviço.</li>
          </ul>
        </Section>

        <Section title="4. Cancelamentos">
          <p>
            O cancelamento do serviço deve ser comunicado com pelo menos <strong>24 horas de antecedência</strong>. Em caso de cancelamento tardio ou ausência no local, poderá ser cobrada uma taxa de deslocação.
          </p>
        </Section>

        <Section title="5. Contacto">
          <p>Para qualquer questão relacionada com esta política, contacte-nos:</p>
          <ul className="list-none space-y-1.5 mt-2">
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:cleansolutions.pt25@gmail.com" className="text-[#1A4E30] underline underline-offset-2">
                cleansolutions.pt25@gmail.com
              </a>
            </li>
            <li>
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/351925530647" className="text-[#1A4E30] underline underline-offset-2">
                +351 925 530 647
              </a>
            </li>
          </ul>
        </Section>

        <div className="mt-10 pt-6 border-t border-[#1A4E30]/10 flex flex-col sm:flex-row gap-3 text-sm">
          <a href="/termos-e-condicoes" className="text-[#1A4E30] underline underline-offset-2 hover:opacity-70 transition-opacity">
            Termos e Condições
          </a>
          <a href="/politica-de-privacidade" className="text-[#1A4E30] underline underline-offset-2 hover:opacity-70 transition-opacity">
            Política de Privacidade
          </a>
        </div>
      </div>
    </main>

    <Footer />
  </>
);

export default PoliticaDevolucoes;
