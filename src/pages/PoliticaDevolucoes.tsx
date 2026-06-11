import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BUSINESS_EMAIL, BUSINESS_EMAIL_HREF, WHATSAPP_BASE, PHONE_DISPLAY } from '@/constants/business';

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
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#111111] leading-tight">
            Política de Devoluções
          </h1>
          <p className="text-sm text-[#555] mt-3">Última atualização: junho de 2026</p>
        </div>

        <Section title="1. Natureza do serviço">
          <p>
            A Kyro Clean Solutions presta serviços de limpeza e higienização profissional de estofos ao domicílio. Por se tratar de um <strong>serviço e não de um produto físico</strong>, não se aplicam devoluções após a conclusão da prestação.
          </p>
          <p>
            Os resultados obtidos dependem do estado de conservação, idade, tipo de material e natureza da sujidade do estofo, fatores externos ao controlo da Kyro Clean Solutions. A variação de resultados em função destes fatores não constitui fundamento para reembolso.
          </p>
        </Section>

        <Section title="2. Direito de livre resolução">
          <p>
            Nos termos do Decreto-Lei n.º 24/2014, de 14 de fevereiro, o consumidor dispõe, em regra, de um prazo de 14 dias para resolver livremente um contrato celebrado à distância, sem necessidade de indicar motivo.
          </p>
          <p>
            <strong>Ao confirmar a marcação do serviço</strong>, o cliente solicita expressamente o início imediato da prestação e declara ter sido informado de que, após a conclusão do serviço, perde o direito de livre resolução, nos termos do artigo 17.º, n.º 1, alínea a) do referido diploma.
          </p>
        </Section>

        <Section title="3. Reclamações">
          <p>
            Caso não esteja satisfeito com o resultado, pode contactar-nos no prazo de <strong>48 horas</strong> após a prestação do serviço, através dos contactos indicados abaixo. Cada situação será analisada individualmente, sendo a decisão sobre qualquer medida de resolução da exclusiva competência da Kyro Clean Solutions.
          </p>
        </Section>

        <Section title="4. Situações não cobertas">
          <p>A Kyro Clean Solutions não assume qualquer responsabilidade por:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Danos, manchas ou defeitos preexistentes, independentemente de terem sido reportados antes do serviço;</li>
            <li>Resultados limitados pelo estado de desgaste, envelhecimento ou composição do material do estofo;</li>
            <li>Manchas de natureza permanente, incluindo tinta, corantes industriais ou substâncias não removíveis por métodos de limpeza profissional;</li>
            <li>Expectativas do cliente que não correspondam ao resultado tecnicamente possível face ao estado do estofo.</li>
          </ul>
        </Section>

        <Section title="5. Cancelamentos">
          <p>
            O cancelamento deve ser comunicado com pelo menos <strong>24 horas de antecedência</strong>. Em caso de cancelamento tardio, ausência no local ou impossibilidade de acesso imputável ao cliente, poderá ser cobrada uma taxa de deslocação.
          </p>
        </Section>

        <Section title="6. Resolução alternativa de litígios">
          <p>
            Em caso de litígio, o consumidor pode recorrer ao <strong>Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC)</strong>, disponível em{' '}
            <a href="https://www.cniacc.pt" target="_blank" rel="noopener noreferrer" className="text-[#1A4E30] underline underline-offset-2">
              www.cniacc.pt
            </a>
            , sem prejuízo do recurso aos tribunais competentes.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p>Para qualquer questão relacionada com esta política:</p>
          <ul className="list-none space-y-1.5 mt-2">
            <li>
              <strong>Email:</strong>{' '}
              <a href={BUSINESS_EMAIL_HREF} className="text-[#1A4E30] underline underline-offset-2">
                {BUSINESS_EMAIL}
              </a>
            </li>
            <li>
              <strong>WhatsApp:</strong>{' '}
              <a href={WHATSAPP_BASE} className="text-[#1A4E30] underline underline-offset-2">
                +351 {PHONE_DISPLAY}
              </a>
            </li>
          </ul>
        </Section>

        <div className="mt-10 pt-6 border-t border-[#1A4E30]/10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
