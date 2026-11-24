// Texto das páginas legais, uma fonte só: a página React (LegalPage.tsx) e o HTML
// estático (scripts/prerender.ts) desenham estes mesmos blocos. Até 25/11/2026 o
// texto vivia nos componentes e o HTML estático levava só um resumo.
//
// Conteúdo jurídico: não se muda uma palavra sem o OK do dono (última: 24/11/2026, sinal, fatura, NIPC,
// equipas parceiras, WhatsApp, assistente com IA, Vendus e conservação das faturas).
//
// Sem imports com alias `@/` (lido em Node puro pelo prerender). Fica fora de
// `legalPages.ts` porque esse está no pacote inicial de todas as páginas (PageHead).
import { DEPOSIT_RULE, SATISFACTION_PROMISE, SATISFACTION_PHOTOS, PRICE_PROMISE } from '../constants/commercialPolicy';
import { BUSINESS_ADDRESS, BUSINESS_EMAIL, BUSINESS_EMAIL_HREF, BUSINESS_LEGAL_NAME, BUSINESS_TAX_ID, PHONE_DISPLAY, PHONE_E164, PHONE_TEL, WHATSAPP_BASE } from '../constants/business';

export interface LegalSection {
  title: string;
  /** Blocos de HTML escritos por nós (nunca entrada do utilizador). */
  body: string[];
  /** Botão que volta a abrir as preferências de cookies. */
  consentButton?: boolean;
}

export const CONSENT_BUTTON_LABEL = 'Rever preferências de cookies';
export const LEGAL_TOC_TITLE = 'Neste documento';

export const LEGAL_CONTENT: Record<string, LegalSection[]> = {
  '/politica-de-privacidade': [
    {
      title: '1. Quem somos',
      body: [
        `<p>A <strong>Kyro Clean Solutions</strong> é uma empresa de limpeza, higienização e impermeabilização de estofos ao domicílio, com a firma ${BUSINESS_LEGAL_NAME} e o NIPC ${BUSINESS_TAX_ID}, sediada em ${BUSINESS_ADDRESS.streetAddress}, ${BUSINESS_ADDRESS.postalCode} ${BUSINESS_ADDRESS.addressLocality}, Portugal.</p>`,
        `<p>Para efeitos do Regulamento Geral de Proteção de Dados (RGPD, Regulamento UE 2016/679), somos o <strong>responsável pelo tratamento</strong> dos dados pessoais recolhidos através deste website.</p>`,
      ],
    },
    {
      title: '2. Dados recolhidos',
      body: [
        `<p>Recolhemos os seguintes dados pessoais:</p>`,
        '<ul>',
        `<li><strong>Dados de contacto:</strong> nome, número de telemóvel e endereço de e-mail, fornecidos voluntariamente no formulário de orçamento.</li>`,
        `<li><strong>Dados do pedido:</strong> tipo de serviço, localização e detalhes sobre os artigos a limpar, incluindo fotografias opcionais enviadas pelo utilizador.</li>`,
        `<li><strong>Conversas:</strong> mensagens, fotografias, vídeos e notas de voz que nos envie por WhatsApp ou e-mail.</li>`,
        `<li><strong>Dados do serviço e de faturação:</strong> morada e data do serviço, valor e, quando pede fatura, nome e número de contribuinte.</li>`,
        `<li><strong>Dados de navegação:</strong> endereço IP, tipo de browser, páginas visitadas, duração da visita e comportamento de navegação, recolhidos através do Google Analytics (GA4) e do Pixel da Meta mediante consentimento. Sem consentimento, a Google recebe apenas os sinais sem cookies descritos na secção 4.</li>`,
        `<li><strong>Cookies:</strong> ficheiros de pequena dimensão guardados no seu dispositivo para garantir o funcionamento do site e, com o seu consentimento, para fins analíticos e publicitários.</li>`,
        '</ul>',
      ],
    },
    {
      title: '3. Finalidade do tratamento',
      body: [
        `<p>Os seus dados são utilizados para:</p>`,
        '<ul>',
        `<li>Responder ao seu pedido de orçamento e agendar a prestação do serviço;</li>`,
        `<li>Enviar confirmações e comunicações relacionadas com o serviço contratado;</li>`,
        `<li>Melhorar a experiência de utilização do website através de dados analíticos agregados (GA4);</li>`,
        `<li>Enviar mensagens de seguimento do orçamento que pediu e, depois do serviço, o pedido de avaliação. Pode pedir para não as receber a qualquer momento;</li>`,
        `<li>Cumprir obrigações legais ou regulatórias aplicáveis.</li>`,
        '</ul>',
      ],
    },
    {
      title: '4. Ferramentas de medição e cookies',
      body: [
        `<p>Este website utiliza o <strong>Google Analytics 4 (GA4)</strong> da Google LLC para recolher dados anónimos sobre o comportamento dos utilizadores. O GA4 utiliza cookies para identificar visitas únicas e analisar padrões de utilização.</p>`,
        `<p>Os cookies do GA4 e do Google Ads só são usados <strong>após o seu consentimento explícito</strong>. Antes de decidir, ou se recusar, as ferramentas da Google funcionam no <strong>modo de consentimento avançado</strong>: não leem nem gravam cookies nem identificadores no seu dispositivo, e enviam à Google apenas sinais sem cookies (data e hora, tipo de browser, página de origem, se a visita veio de um anúncio e o estado do seu consentimento). A Google usa esses sinais de forma agregada para estimar os resultados das campanhas.</p>`,
        `<p>Utilizamos também o <strong>Pixel da Meta</strong>, fornecido pela Meta Platforms Ireland Limited, para medir visitas e campanhas publicitárias. Este Pixel só é carregado após o seu consentimento para publicidade.</p>`,
        `<p>Utilizamos ainda cookies funcionais estritamente necessários para o correto funcionamento do site (por exemplo, guardar a sua preferência de consentimento). Estes não requerem consentimento.</p>`,
        `<p>Para mais informações sobre como o Google trata os dados, consulte a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade do Google</a>.</p>`,
      ],
    },
    {
      title: '5. Base legal',
      body: [
        `<p>O tratamento dos seus dados baseia-se em:</p>`,
        '<ul>',
        `<li><strong>Execução de contrato</strong> (Art. 6.º, n.º 1, al. b) do RGPD): para processar o seu pedido de orçamento e prestar o serviço.</li>`,
        `<li><strong>Consentimento</strong> (Art. 6.º, n.º 1, al. a) do RGPD): para cookies analíticos e comunicações de marketing.</li>`,
        `<li><strong>Interesses legítimos</strong> (Art. 6.º, n.º 1, al. f) do RGPD): para melhorar o website, prevenir fraudes e medir de forma agregada, sem cookies, os resultados das campanhas publicitárias (secção 4); responder às mensagens, enviar o seguimento do orçamento pedido e o pedido de avaliação.</li>`,
        `<li><strong>Obrigação legal</strong> (Art. 6.º, n.º 1, al. c) do RGPD): para emitir e conservar as faturas.</li>`,
        '</ul>',
      ],
    },
    {
      title: '6. Partilha de dados',
      body: [
        `<p>Não vendemos nem cedemos os seus dados pessoais a terceiros para fins comerciais. Os seus dados podem ser partilhados com:</p>`,
        '<ul>',
        `<li><strong>Google LLC</strong>: através do GA4 e do Google Ads, com o seu consentimento, para análise de tráfego e medição de campanhas; sem consentimento, apenas os sinais sem cookies descritos na secção 4;</li>`,
        `<li><strong>Google LLC, medição de serviços contratados (Google Ads)</strong>: se chegou ao site por um anúncio do Google, a mensagem de WhatsApp leva uma referência curta (por exemplo "ref. K7F2Q"), que guardamos no nosso servidor com o identificador do clique no anúncio, sem gravar nada no seu dispositivo. Se contratar um serviço, enviamos à Google esse identificador ou o seu número de telefone em formato cifrado (hash), com a data e o valor do serviço, para medir quais os anúncios que trazem clientes. A Google só usa estes dados para essa medição. Base legal: interesse legítimo em medir a eficácia da publicidade. Pode opor-se a qualquer momento através do contacto indicado nesta política;</li>`,
        `<li><strong>Meta Platforms Ireland Limited</strong>: através do Pixel da Meta, mediante consentimento, para medição de visitas e campanhas;</li>`,
        `<li><strong>Meta Platforms Ireland Limited, medição de contactos e de serviços contratados</strong>: se nos contactou através de um anúncio da Meta ou contratou um serviço, podemos enviar à Meta o seu número de telefone em formato cifrado (hash), com a data e o valor do serviço, para medir quais os anúncios que trazem clientes. Base legal: interesse legítimo em medir a eficácia da publicidade. Pode opor-se a qualquer momento através do contacto indicado nesta política;</li>`,
        `<li><strong>Equipas parceiras</strong>: as equipas que realizam o serviço em cada zona recebem apenas o necessário para o fazer (nome, contacto, morada, data, fotografias, descrição e valor do serviço);</li>`,
        `<li><strong>WhatsApp (Meta Platforms Ireland Limited) e 360dialog</strong>: fornecedores do canal por onde trocamos mensagens consigo;</li>`,
        `<li><strong>Anthropic</strong>: fornecedor do assistente de inteligência artificial que lê e responde a mensagens de WhatsApp e e-mail, com acompanhamento da nossa equipa. As notas de voz são transcritas no nosso próprio servidor;</li>`,
        `<li><strong>Hostinger</strong>: servidor onde funciona o assistente e onde ficam guardadas as conversas;</li>`,
        `<li><strong>Google (Gmail e Google Calendar)</strong>: e-mail e agenda das marcações;</li>`,
        `<li><strong>Vendus</strong>: emissão das faturas, com o nome, o número de contribuinte e os dados do serviço;</li>`,
        `<li><strong>Google reCAPTCHA</strong> (Google LLC): só no momento em que envia um pedido de orçamento, para distinguir pedidos reais de envios automáticos (spam). O reCAPTCHA recolhe informação técnica do browser e da interação com a página, tratada pela Google segundo a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidade</a> e os <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Termos de Serviço</a> da Google. Base legal: interesse legítimo na segurança do formulário. Um resultado duvidoso nunca impede o pedido de nos chegar;</li>`,
        `<li><strong>Resend</strong>: plataforma utilizada para o envio de emails com os pedidos de orçamento de forma segura;</li>`,
        `<li><strong>Localização opcional (BigDataCloud)</strong>: ao permitir a localização no navegador, as coordenadas atuais são enviadas diretamente ao BigDataCloud para sugerir a localidade do serviço. O fornecedor recebe também o endereço IP e usa estes sinais para melhorar os seus dados de geolocalização. Não guardamos as coordenadas no pedido, apenas a localidade confirmada. Pode recusar a localização e pesquisar manualmente. Consulte a <a href="https://www.bigdatacloud.com/privacy-policy" target="_blank" rel="noopener noreferrer">política do fornecedor</a>.</li>`,
        `<li><strong>Supabase</strong>: base de dados segura onde os pedidos são armazenados temporariamente para gestão interna.</li>`,
        '</ul>',
        `<p>Todos os subprocessadores operam em conformidade com o RGPD e dispõem de salvaguardas adequadas.</p>`,
      ],
    },
    {
      title: '7. Retenção de dados',
      body: [
        `<p>Os dados de contacto associados a pedidos de orçamento são conservados durante <strong>12 meses</strong> após a última interação, findo o qual são eliminados. Dados analíticos recolhidos pelo GA4 são conservados durante 14 meses, de acordo com as definições padrão da Google.</p>`,
        `<p>Os dados que constam das faturas são conservados durante <strong>10 anos</strong>, como exige a lei fiscal.</p>`,
      ],
    },
    {
      title: '8. Os seus direitos',
      body: [
        `<p>Ao abrigo do RGPD, tem os seguintes direitos:</p>`,
        '<ul>',
        `<li><strong>Acesso</strong>: solicitar uma cópia dos dados que guardamos sobre si;</li>`,
        `<li><strong>Retificação</strong>: corrigir dados incorretos ou incompletos;</li>`,
        `<li><strong>Eliminação</strong>: solicitar a eliminação dos seus dados ("direito a ser esquecido");</li>`,
        `<li><strong>Oposição</strong>: opor-se ao tratamento baseado em interesses legítimos;</li>`,
        `<li><strong>Portabilidade</strong>: receber os seus dados num formato estruturado e legível por máquina;</li>`,
        `<li><strong>Retirar o consentimento</strong>: a qualquer momento, sem prejuízo do tratamento já realizado.</li>`,
        '</ul>',
        `<p>Para exercer qualquer um destes direitos, contacte-nos através do e-mail abaixo. Responderemos no prazo máximo de <strong>30 dias</strong>.</p>`,
      ],
    },
    {
      title: '9. Segurança',
      body: [
        `<p>Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, perda ou divulgação indevida, incluindo transmissão cifrada (HTTPS) e acesso restrito às bases de dados internas.</p>`,
      ],
    },
    {
      title: '10. Autoridade de controlo',
      body: [
        `<p>Tem o direito de apresentar reclamação junto da autoridade de supervisão competente em Portugal: a <strong>CNPD, Comissão Nacional de Proteção de Dados</strong> (<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>).</p>`,
      ],
    },
    {
      title: 'Preferências de medição',
      body: [
        `<p>A medição própria de visitas e o Pixel da Meta só são ativados após aceitar. Com essa autorização, os parâmetros da campanha e a página de entrada podem ser associados ao pedido para medir a origem dos contactos. O Google Analytics e o Google Ads carregam em todas as visitas, mas só usam cookies depois de aceitar; até lá, funcionam como descrito na secção 4. Recusar não impede pedir um orçamento.</p>`,
      ],
      consentButton: true,
    },
    {
      title: '11. Contacto',
      body: [
        `<p>Para qualquer questão relacionada com esta política ou para exercer os seus direitos, contacte o responsável pelo tratamento:</p>`,
        '<address>',
        `<p><strong>Kyro Clean Solutions</strong></p>`,
        `<p>${BUSINESS_ADDRESS.streetAddress}, ${BUSINESS_ADDRESS.postalCode} ${BUSINESS_ADDRESS.addressLocality}</p>`,
        `<p>E-mail: <a href="${BUSINESS_EMAIL_HREF}">${BUSINESS_EMAIL}</a></p>`,
        `<p>Telefone: <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></p>`,
        '</address>',
      ],
    },
  ],
  '/termos-e-condicoes': [
    {
      title: '1. Identificação',
      body: [
        `<p><strong>Kyro Clean Solutions</strong>: serviço de limpeza, higienização e impermeabilização profissional de estofos ao domicílio.</p>`,
        `<p>${BUSINESS_LEGAL_NAME}, NIPC ${BUSINESS_TAX_ID}.</p>`,
        `<p>Morada: ${BUSINESS_ADDRESS.streetAddress}, ${BUSINESS_ADDRESS.postalCode} ${BUSINESS_ADDRESS.addressLocality}, Portugal.<br>Email: <a href="${BUSINESS_EMAIL_HREF}">${BUSINESS_EMAIL}</a><br>Telefone / WhatsApp: <a href="tel:${PHONE_E164}">+351 ${PHONE_DISPLAY}</a></p>`,
      ],
    },
    {
      title: '2. Objeto',
      body: [
        `<p>A Kyro Clean Solutions presta serviços de limpeza e higienização profissional de sofás, colchões, tapetes, cadeiras e outros estofos, bem como impermeabilização profissional de sofás, cadeiras e outros estofos, realizados no domicílio do cliente ou em local acordado entre as partes.</p>`,
      ],
    },
    {
      title: '3. Orçamentos e reservas',
      body: [
        `<p>Os orçamentos são gratuitos e sem compromisso, fornecidos via formulário no website, WhatsApp ou telefone. A confirmação do serviço é feita por escrito e só se considera vinculativa após confirmação expressa de ambas as partes.</p>`,
        `<p>${PRICE_PROMISE}</p>`,
        `<p>${DEPOSIT_RULE}</p>`,
      ],
    },
    {
      title: '4. Prestação do serviço',
      body: [
        `<p>O cliente deve garantir o acesso ao local e às tomadas elétricas necessárias. Em caso de impossibilidade de acesso na data acordada por motivo imputável ao cliente, poderá ser cobrada uma taxa de deslocação.</p>`,
        `<p>A Kyro Clean Solutions aplica produtos e técnicas adequados ao tipo de material identificado. Os resultados obtidos dependem do estado de conservação, envelhecimento e composição do estofo, não sendo possível garantir resultados específicos independentemente desses fatores. As limitações e os danos preexistentes são explicados antes de começar. Não afastam a repetição gratuita quando a insatisfação é comunicada até 48 horas após o serviço, nos termos da garantia comercial.</p>`,
      ],
    },
    {
      title: '5. Direito de livre resolução',
      body: [
        `<p>Nos termos do Decreto-Lei n.º 24/2014, o consumidor dispõe, em regra, de 14 dias para resolver livremente contratos celebrados à distância. <strong>Ao confirmar a marcação</strong>, o cliente solicita expressamente o início imediato da prestação e reconhece que, após a conclusão do serviço, perde o direito de livre resolução, nos termos do artigo 17.º, n.º 1, alínea a) do referido diploma.</p>`,
      ],
    },
    {
      title: '6. Pagamento',
      body: [
        `<p>O pagamento é efetuado no final da prestação do serviço, salvo acordo prévio em contrário e o sinal referido na secção 3. Aceitamos transferência bancária, MB Way e numerário.</p>`,
        `<p>Nos serviços com fatura, o pagamento é sempre feito por transferência bancária para a conta da empresa, com o IBAN que enviamos ao cliente.</p>`,
      ],
    },
    {
      title: '7. Cancelamentos',
      body: [
        `<p>O cancelamento deve ser comunicado com pelo menos 24 horas de antecedência. Cancelamentos com menos de 24 horas ou ausências no local poderão implicar uma taxa de deslocação.</p>`,
        `<p>Nas reservas com sinal aplica-se também a secção 3.</p>`,
      ],
    },
    {
      title: '8. Reclamações',
      body: [
        `<p>${SATISFACTION_PROMISE} ${SATISFACTION_PHOTOS} Para mais detalhes, consulte a nossa <a href="/politica-de-devolucoes">Política de Devoluções</a>.</p>`,
      ],
    },
    {
      title: '9. Propriedade intelectual',
      body: [
        `<p>Todo o conteúdo deste website (textos, imagens, logótipos) é propriedade da Kyro Clean Solutions e não pode ser reproduzido sem autorização expressa.</p>`,
      ],
    },
    {
      title: '10. Proteção de dados',
      body: [
        `<p>O tratamento dos dados pessoais é efetuado de acordo com a nossa <a href="/politica-de-privacidade">Política de Privacidade</a>, em conformidade com o RGPD.</p>`,
      ],
    },
    {
      title: '11. Resolução alternativa de litígios',
      body: [
        `<p>Em caso de litígio, o consumidor pode recorrer ao <strong>Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC)</strong>, disponível em <a href="https://www.cniacc.pt" target="_blank" rel="noopener noreferrer">www.cniacc.pt</a>. Os presentes termos são regidos pela lei portuguesa, sendo competente o tribunal da comarca do Porto para litígios não sujeitos a arbitragem.</p>`,
      ],
    },
  ],
  '/politica-de-devolucoes': [
    {
      title: '1. Natureza do serviço',
      body: [
        `<p>A Kyro Clean Solutions presta serviços de limpeza e higienização profissional de estofos ao domicílio. Por se tratar de um <strong>serviço e não de um produto físico</strong>, não se aplicam devoluções após a conclusão da prestação.</p>`,
        `<p>Os resultados obtidos dependem do estado de conservação, idade, tipo de material e natureza da sujidade do estofo, fatores externos ao controlo da Kyro Clean Solutions. A variação de resultados em função destes fatores não constitui fundamento para reembolso.</p>`,
      ],
    },
    {
      title: '2. Direito de livre resolução',
      body: [
        `<p>Nos termos do Decreto-Lei n.º 24/2014, de 14 de fevereiro, o consumidor dispõe, em regra, de um prazo de 14 dias para resolver livremente um contrato celebrado à distância, sem necessidade de indicar motivo.</p>`,
        `<p><strong>Ao confirmar a marcação do serviço</strong>, o cliente solicita expressamente o início imediato da prestação e declara ter sido informado de que, após a conclusão do serviço, perde o direito de livre resolução, nos termos do artigo 17.º, n.º 1, alínea a) do referido diploma.</p>`,
        `<p>${DEPOSIT_RULE}</p>`,
      ],
    },
    {
      title: '3. Reclamações',
      body: [
        `<p>${SATISFACTION_PROMISE} ${SATISFACTION_PHOTOS}</p>`,
      ],
    },
    {
      title: '4. Resultado acordado e limitações do material',
      body: [
        `<p>Antes do serviço avaliamos o artigo e explicamos limitações como desgaste, danos preexistentes ou manchas que podem ser permanentes. Essas limitações não são uma promessa de reparação ou de remoção total.</p>`,
        `<p>A existência de uma mancha ou dano anterior não retira o acesso à repetição gratuita quando o cliente comunica insatisfação até 48 horas após o serviço. Repetimos a intervenção sem custos nos termos da garantia comercial, com o processo adequado ao artigo e às limitações previamente explicadas.</p>`,
        `<p>A repetição não garante a recuperação de tecidos desgastados nem a remoção de manchas permanentes. Os direitos legais do cliente mantêm-se.</p>`,
      ],
    },
    {
      title: '5. Cancelamentos',
      body: [
        `<p>O cancelamento deve ser comunicado com pelo menos <strong>24 horas de antecedência</strong>. Em caso de cancelamento tardio, ausência no local ou impossibilidade de acesso imputável ao cliente, poderá ser cobrada uma taxa de deslocação.</p>`,
      ],
    },
    {
      title: '6. Resolução alternativa de litígios',
      body: [
        `<p>Em caso de litígio, o consumidor pode recorrer ao <strong>Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC)</strong>, disponível em <a href="https://www.cniacc.pt" target="_blank" rel="noopener noreferrer">www.cniacc.pt</a>, sem prejuízo do recurso aos tribunais competentes.</p>`,
      ],
    },
    {
      title: '7. Contacto',
      body: [
        `<p>Para qualquer questão relacionada com esta política:</p>`,
        '<ul>',
        `<li><strong>Email:</strong> <a href="${BUSINESS_EMAIL_HREF}">${BUSINESS_EMAIL}</a></li>`,
        `<li><strong>WhatsApp:</strong> <a href="${WHATSAPP_BASE}">+351 ${PHONE_DISPLAY}</a></li>`,
        '</ul>',
      ],
    },
  ],
};

/** `2. Dados recolhidos` -> `dados-recolhidos`, a âncora da secção. */
export const legalSectionId = (title: string) =>
  title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^\d+\.\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** O documento em HTML simples, para o `scripts/prerender.ts`: mesmo índice, mesmas secções e mesmo texto da página. */
export function renderLegalHtml(path: string, others: { href: string; label: string }[]): string {
  const sections = LEGAL_CONTENT[path] ?? [];
  const toc = `<nav aria-label="${LEGAL_TOC_TITLE}"><p>${LEGAL_TOC_TITLE}</p><ul>${sections.map(x => `<li><a href="#${legalSectionId(x.title)}">${x.title}</a></li>`).join('')}</ul></nav>\n`;
  const body = sections.map(x => `<section id="${legalSectionId(x.title)}"><h2>${x.title}</h2>${x.body.join('')}${x.consentButton ? `<button type="button">${CONSENT_BUTTON_LABEL}</button>` : ''}</section>`).join('\n');
  const nav = `\n<nav aria-label="Outros documentos legais"><ul>${others.map(x => `<li><a href="${x.href}">${x.label}</a></li>`).join('')}</ul></nav>\n`;
  return toc + body + nav;
}
