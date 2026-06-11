import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BUSINESS_EMAIL, BUSINESS_EMAIL_HREF, PHONE_E164, PHONE_DISPLAY, BUSINESS_ADDRESS } from '@/constants/business';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="font-playfair text-xl font-bold text-[#1A4E30] mb-3">{title}</h2>
    <div className="text-[#333] leading-relaxed space-y-3 text-[15px]">{children}</div>
  </section>
);

const TermosCondicoes = () => (
  <>
    <Header />

    <main className="bg-[#FDFDF9] min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="pt-8 pb-6 border-b border-[#1A4E30]/10 mb-8">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-2">Kyro Clean Solutions</p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-[#111111] leading-tight">
            Termos e Condições
          </h1>
          <p className="text-sm text-[#555] mt-3">Última atualização: junho de 2026</p>
        </div>

        <Section title="1. Identificação">
          <p>
            <strong>Kyro Clean Solutions</strong>: serviço de limpeza e higienização profissional de estofos ao domicílio.
          </p>
          <p>
            Morada: {BUSINESS_ADDRESS.streetAddress}, {BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}, Portugal.<br />
            Email: <a href={BUSINESS_EMAIL_HREF} className="text-[#1A4E30] underline underline-offset-2">{BUSINESS_EMAIL}</a><br />
            Telefone / WhatsApp: <a href={`tel:${PHONE_E164}`} className="text-[#1A4E30] underline underline-offset-2">+351 {PHONE_DISPLAY}</a>
          </p>
        </Section>

        <Section title="2. Objeto">
          <p>
            A Kyro Clean Solutions presta serviços de limpeza, higienização e impermeabilização profissional de sofás, colchões, tapetes, cadeiras e outros estofos, realizados no domicílio do cliente ou em local acordado entre as partes.
          </p>
        </Section>

        <Section title="3. Orçamentos e reservas">
          <p>
            Os orçamentos são gratuitos e sem compromisso, fornecidos via formulário no website, WhatsApp ou telefone. A confirmação do serviço é feita por escrito e só se considera vinculativa após confirmação expressa de ambas as partes.
          </p>
          <p>
            Os preços indicados no website são de referência. O preço final pode variar consoante o estado de conservação, dimensões reais e tipo de material do estofo, sendo comunicado ao cliente antes do início do serviço.
          </p>
        </Section>

        <Section title="4. Prestação do serviço">
          <p>
            O cliente deve garantir o acesso ao local e às tomadas elétricas necessárias. Em caso de impossibilidade de acesso na data acordada por motivo imputável ao cliente, poderá ser cobrada uma taxa de deslocação.
          </p>
          <p>
            A Kyro Clean Solutions aplica produtos e técnicas adequados ao tipo de material identificado. Os resultados obtidos dependem do estado de conservação, envelhecimento e composição do estofo, não sendo possível garantir resultados específicos independentemente desses fatores. A Kyro Clean Solutions não se responsabiliza por danos preexistentes nem por limitações de resultado inerentes ao estado do estofo.
          </p>
        </Section>

        <Section title="5. Direito de livre resolução">
          <p>
            Nos termos do Decreto-Lei n.º 24/2014, o consumidor dispõe, em regra, de 14 dias para resolver livremente contratos celebrados à distância. <strong>Ao confirmar a marcação</strong>, o cliente solicita expressamente o início imediato da prestação e reconhece que, após a conclusão do serviço, perde o direito de livre resolução, nos termos do artigo 17.º, n.º 1, alínea a) do referido diploma.
          </p>
        </Section>

        <Section title="6. Pagamento">
          <p>
            O pagamento é efetuado no final da prestação do serviço, salvo acordo prévio em contrário. Aceitamos transferência bancária, MB Way e numerário.
          </p>
        </Section>

        <Section title="7. Cancelamentos">
          <p>
            O cancelamento deve ser comunicado com pelo menos 24 horas de antecedência. Cancelamentos com menos de 24 horas ou ausências no local poderão implicar uma taxa de deslocação.
          </p>
        </Section>

        <Section title="8. Reclamações">
          <p>
            Caso não esteja satisfeito com o resultado do serviço, contacte-nos no prazo de 48 horas após a prestação. Cada situação será analisada individualmente, sendo a decisão sobre qualquer medida de resolução da exclusiva competência da Kyro Clean Solutions. Para mais detalhes, consulte a nossa{' '}
            <a href="/politica-de-devolucoes" className="text-[#1A4E30] underline underline-offset-2">Política de Devoluções</a>.
          </p>
        </Section>

        <Section title="9. Propriedade intelectual">
          <p>
            Todo o conteúdo deste website (textos, imagens, logótipos) é propriedade da Kyro Clean Solutions e não pode ser reproduzido sem autorização expressa.
          </p>
        </Section>

        <Section title="10. Proteção de dados">
          <p>
            O tratamento dos dados pessoais é efetuado de acordo com a nossa{' '}
            <a href="/politica-de-privacidade" className="text-[#1A4E30] underline underline-offset-2">Política de Privacidade</a>,
            em conformidade com o RGPD.
          </p>
        </Section>

        <Section title="11. Resolução alternativa de litígios">
          <p>
            Em caso de litígio, o consumidor pode recorrer ao <strong>Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC)</strong>, disponível em{' '}
            <a href="https://www.cniacc.pt" target="_blank" rel="noopener noreferrer" className="text-[#1A4E30] underline underline-offset-2">
              www.cniacc.pt
            </a>.
            Os presentes termos são regidos pela lei portuguesa, sendo competente o tribunal da comarca do Porto para litígios não sujeitos a arbitragem.
          </p>
        </Section>
      </div>
    </main>

    <Footer />
  </>
);

export default TermosCondicoes;
