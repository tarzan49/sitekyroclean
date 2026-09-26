import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BUSINESS_EMAIL, BUSINESS_EMAIL_HREF, PHONE_TEL, PHONE_DISPLAY, BUSINESS_ADDRESS } from '@/constants/business';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="type-section-title font-playfair   text-[#1A4E30] mb-3">{title}</h2>
    <div className="text-[#333] leading-relaxed space-y-3 text-base">{children}</div>
  </section>
);

const PoliticaPrivacidade = () => (
  <>
    <Header />

    <main className="bg-[#FDFDF9] min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-6">
        <div className="pt-8 pb-6 border-b border-[#1A4E30]/10 mb-8">
          <p className="text-sm font-bold tracking-[0.08em] uppercase text-[#D4AF37] mb-2">Kyro Clean Solutions</p>
          <h1 className="type-page-title font-playfair    text-[#111111] ">
            Política de Privacidade
          </h1>
          <p className="text-base text-[#555] mt-3">Última atualização: setembro de 2026</p>
        </div>

        <Section title="1. Quem somos">
          <p>
            A <strong>Kyro Clean Solutions</strong> é uma empresa de limpeza e higienização de estofos ao domicílio, sediada em {BUSINESS_ADDRESS.streetAddress}, {BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}, Portugal.
          </p>
          <p>
            Para efeitos do Regulamento Geral de Proteção de Dados (RGPD, Regulamento UE 2016/679), somos o <strong>responsável pelo tratamento</strong> dos dados pessoais recolhidos através deste website.
          </p>
        </Section>

        <Section title="2. Dados recolhidos">
          <p>Recolhemos os seguintes dados pessoais:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Dados de contacto:</strong> nome, número de telemóvel e endereço de e-mail, fornecidos voluntariamente no formulário de orçamento.</li>
            <li><strong>Dados do pedido:</strong> tipo de serviço, localização e detalhes sobre os artigos a limpar, incluindo fotografias opcionais enviadas pelo utilizador.</li>
            <li><strong>Dados de navegação:</strong> endereço IP, tipo de browser, páginas visitadas, duração da visita e comportamento de navegação, recolhidos através do Google Analytics (GA4) e do Pixel da Meta mediante consentimento. Sem consentimento, a Google recebe apenas os sinais sem cookies descritos na secção 4.</li>
            <li><strong>Cookies:</strong> ficheiros de pequena dimensão guardados no seu dispositivo para garantir o funcionamento do site e, com o seu consentimento, para fins analíticos e publicitários.</li>
          </ul>
        </Section>

        <Section title="3. Finalidade do tratamento">
          <p>Os seus dados são utilizados para:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Responder ao seu pedido de orçamento e agendar a prestação do serviço;</li>
            <li>Enviar confirmações e comunicações relacionadas com o serviço contratado;</li>
            <li>Melhorar a experiência de utilização do website através de dados analíticos agregados (GA4);</li>
            <li>Cumprir obrigações legais ou regulatórias aplicáveis.</li>
          </ul>
        </Section>

        <Section title="4. Ferramentas de medição e cookies">
          <p>
            Este website utiliza o <strong>Google Analytics 4 (GA4)</strong> da Google LLC para recolher dados anónimos sobre o comportamento dos utilizadores. O GA4 utiliza cookies para identificar visitas únicas e analisar padrões de utilização.
          </p>
          <p>
            Os cookies do GA4 e do Google Ads só são usados <strong>após o seu consentimento explícito</strong>. Antes de decidir, ou se recusar, as ferramentas da Google funcionam no <strong>modo de consentimento avançado</strong>: não leem nem gravam cookies nem identificadores no seu dispositivo, e enviam à Google apenas sinais sem cookies (data e hora, tipo de browser, página de origem, se a visita veio de um anúncio e o estado do seu consentimento). A Google usa esses sinais de forma agregada para estimar os resultados das campanhas.
          </p>
          <p>
            Utilizamos também o <strong>Pixel da Meta</strong>, fornecido pela Meta Platforms Ireland Limited, para medir visitas e campanhas publicitárias. Este Pixel só é carregado após o seu consentimento para publicidade.
          </p>
          <p>
            Utilizamos ainda cookies funcionais estritamente necessários para o correto funcionamento do site (por exemplo, guardar a sua preferência de consentimento). Estes não requerem consentimento.
          </p>
          <p>
            Para mais informações sobre como o Google trata os dados, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1A4E30] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">Política de Privacidade do Google</a>.
          </p>
        </Section>

        <Section title="5. Base legal">
          <p>O tratamento dos seus dados baseia-se em:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Execução de contrato</strong> (Art. 6.º, n.º 1, al. b) do RGPD): para processar o seu pedido de orçamento e prestar o serviço.</li>
            <li><strong>Consentimento</strong> (Art. 6.º, n.º 1, al. a) do RGPD): para cookies analíticos e comunicações de marketing.</li>
            <li><strong>Interesses legítimos</strong> (Art. 6.º, n.º 1, al. f) do RGPD): para melhorar o website, prevenir fraudes e medir de forma agregada, sem cookies, os resultados das campanhas publicitárias (secção 4).</li>
          </ul>
        </Section>

        <Section title="6. Partilha de dados">
          <p>
            Não vendemos nem cedemos os seus dados pessoais a terceiros para fins comerciais. Os seus dados podem ser partilhados com:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Google LLC</strong>: através do GA4 e do Google Ads, com o seu consentimento, para análise de tráfego e medição de campanhas; sem consentimento, apenas os sinais sem cookies descritos na secção 4;</li>
            <li><strong>Meta Platforms Ireland Limited</strong>: através do Pixel da Meta, mediante consentimento, para medição de visitas e campanhas;</li>
            <li><strong>Resend</strong>: plataforma utilizada para o envio de emails com os pedidos de orçamento de forma segura;</li>
            <li><strong>Localização opcional (BigDataCloud)</strong>: ao permitir a localização no navegador, as coordenadas atuais são enviadas diretamente ao BigDataCloud para sugerir a localidade do serviço. O fornecedor recebe também o endereço IP e usa estes sinais para melhorar os seus dados de geolocalização. Não guardamos as coordenadas no pedido, apenas a localidade confirmada. Pode recusar a localização e pesquisar manualmente. Consulte a <a href="https://www.bigdatacloud.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline">política do fornecedor</a>.</li>
            <li><strong>Supabase</strong>: base de dados segura onde os pedidos são armazenados temporariamente para gestão interna.</li>
          </ul>
          <p>Todos os subprocessadores operam em conformidade com o RGPD e dispõem de salvaguardas adequadas.</p>
        </Section>

        <Section title="7. Retenção de dados">
          <p>
            Os dados de contacto associados a pedidos de orçamento são conservados durante <strong>12 meses</strong> após a última interação, findo o qual são eliminados. Dados analíticos recolhidos pelo GA4 são conservados durante 14 meses, de acordo com as definições padrão da Google.
          </p>
        </Section>

        <Section title="8. Os seus direitos">
          <p>Ao abrigo do RGPD, tem os seguintes direitos:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Acesso</strong>: solicitar uma cópia dos dados que guardamos sobre si;</li>
            <li><strong>Retificação</strong>: corrigir dados incorretos ou incompletos;</li>
            <li><strong>Eliminação</strong>: solicitar a eliminação dos seus dados ("direito a ser esquecido");</li>
            <li><strong>Oposição</strong>: opor-se ao tratamento baseado em interesses legítimos;</li>
            <li><strong>Portabilidade</strong>: receber os seus dados num formato estruturado e legível por máquina;</li>
            <li><strong>Retirar o consentimento</strong>: a qualquer momento, sem prejuízo do tratamento já realizado.</li>
          </ul>
          <p>
            Para exercer qualquer um destes direitos, contacte-nos através do e-mail abaixo. Responderemos no prazo máximo de <strong>30 dias</strong>.
          </p>
        </Section>

        <Section title="9. Segurança">
          <p>
            Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, perda ou divulgação indevida, incluindo transmissão cifrada (HTTPS) e acesso restrito às bases de dados internas.
          </p>
        </Section>

        <Section title="10. Autoridade de controlo">
          <p>
            Tem o direito de apresentar reclamação junto da autoridade de supervisão competente em Portugal: a <strong>CNPD, Comissão Nacional de Proteção de Dados</strong> (<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-[#1A4E30] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">www.cnpd.pt</a>).
          </p>
        </Section>

        <Section title="Preferências de medição">
          <p>A medição própria de visitas e o Pixel da Meta só são ativados após aceitar. Com essa autorização, os parâmetros da campanha e a página de entrada podem ser associados ao pedido para medir a origem dos contactos. O Google Analytics e o Google Ads carregam em todas as visitas, mas só usam cookies depois de aceitar; até lá, funcionam como descrito na secção 4. Recusar não impede pedir um orçamento.</p>
          <button type="button" className="min-h-11 underline" onClick={() => window.dispatchEvent(new Event('kyro:open-consent'))}>Rever preferências de cookies</button>
        </Section>

        <Section title="11. Contacto">
          <p>Para qualquer questão relacionada com esta política ou para exercer os seus direitos, contacte o responsável pelo tratamento:</p>
          <div className="bg-[#f5f9f6] border border-[#1A4E30]/10 rounded-xl px-5 py-4 mt-2 space-y-1 text-base">
            <p><strong>Kyro Clean Solutions</strong></p>
            <p>{BUSINESS_ADDRESS.streetAddress}, {BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}</p>
            <p>
              E-mail:{' '}
              <a href={BUSINESS_EMAIL_HREF} className="text-[#1A4E30] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">
                {BUSINESS_EMAIL}
              </a>
            </p>
            <p>Telefone: <a href={`tel:${PHONE_TEL}`} className="text-[#1A4E30] underline underline-offset-2 hover:text-[#D4AF37] transition-colors">{PHONE_DISPLAY}</a></p>
          </div>
        </Section>
      </div>
    </main>

    <Footer />
  </>
);

export default PoliticaPrivacidade;
