// O script dos emails (google-apps-script/emails/Emails.gs) corre na conta Google
// do negócio, não no site. Este teste carrega o ficheiro tal como está e fixa as
// decisões que não podem falhar: a quem sai a resposta automática, o que fica em
// "Por responder" e o texto aprovado pelo dono a 27/10/2026. Só dados inventados:
// o repositório é público.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

const FILE = path.resolve(__dirname, '../../google-apps-script/emails/Emails.gs');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gs: any = vm.createContext({});
vm.runInContext(readFileSync(FILE, 'utf8'), gs);

const INSTALADO = Date.parse('2026-10-27T10:00:00Z');
const AGORA = Date.parse('2026-10-28T12:00:00Z');
const NOS = 'Kyro Clean Solutions <cleansolutions.pt25@gmail.com>';

const msg = (de: string, quando: string, corpo = 'Boa tarde, queria saber o preço para limpar um sofá.', cabecalhos = {}) =>
  ({ de, corpo, cabecalhos, data: Date.parse(quando) });

describe('resposta automática', () => {
  it('responde a uma conversa nova de uma pessoa', () => {
    const d = gs.decidir([msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z')], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: true, porResponder: true });
  });

  it('nunca responde a uma conversa que já tem uma mensagem nossa', () => {
    const d = gs.decidir([
      msg(NOS, '2026-10-28T09:00:00Z', 'Boa tarde, segue o orçamento.'),
      msg('Empresa Teste <compras@empresa-teste.pt>', '2026-10-28T11:00:00Z', 'Quando sai a fatura?'),
    ], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: false, porResponder: true });
  });

  it('não responde a emails anteriores à instalação, mas marca-os por responder', () => {
    const d = gs.decidir([msg('Maria Teste <maria@exemplo.pt>', '2026-10-26T11:00:00Z')], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: false, porResponder: true });
  });

  it('uma pessoa recebe no máximo uma resposta automática por semana', () => {
    const d = gs.decidir([msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z')], AGORA, INSTALADO, AGORA - 2 * 24 * 3600 * 1000);
    expect(d.responder).toBe(false);
  });

  it.each([
    'Loja <no-reply@loja-teste.pt>',
    'App <testflight_no_reply@email.apple.com>',
    'Rede <messages-noreply@linkedin.com>',
    'Google Ads <alguem@xwf.google.com>',
    'IRN <certificado@irn.mj.pt>',
    'Mailer <mailer-daemon@googlemail.com>',
    'Novidades <newsletter@marca-teste.pt>',
  ])('nunca responde a remetentes automáticos: %s', (de) => {
    expect(gs.decidir([msg(de, '2026-10-28T11:00:00Z')], AGORA, INSTALADO, 0)).toMatchObject({ responder: false, porResponder: false });
  });

  it.each([
    { 'Auto-Submitted': 'auto-replied' },
    { 'List-Unsubscribe': '<mailto:sair@lista.pt>' },
    { Precedence: 'bulk' },
  ])('nunca responde a mensagens enviadas por máquinas: %o', (cab) => {
    const d = gs.decidir([msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z', 'Ausente do escritório', cab)], AGORA, INSTALADO, 0);
    expect(d.responder).toBe(false);
  });

  it('nunca responde aos alertas do bot', () => {
    const d = gs.decidir([msg('Kyro Bot <pedidos@cleansolutions.com.pt>', '2026-10-28T11:00:00Z')], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: false, porResponder: false });
  });
});

describe('por responder', () => {
  it('a resposta automática não conta como resposta do dono', () => {
    const d = gs.decidir([
      msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z'),
      msg(NOS, '2026-10-28T11:05:00Z', gs.respostaAutomatica('Maria', false)),
    ], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: false, porResponder: true });
  });

  it('sai de por responder quando o dono responde', () => {
    const d = gs.decidir([
      msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z'),
      msg(NOS, '2026-10-28T11:05:00Z', gs.respostaAutomatica('Maria', false)),
      msg(NOS, '2026-10-28T11:30:00Z', 'Olá Maria, o sofá de 3 lugares fica a 69€.'),
    ], AGORA, INSTALADO, 0);
    expect(d.porResponder).toBe(false);
  });

  it('volta a por responder quando a pessoa escreve outra vez', () => {
    const d = gs.decidir([
      msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:00:00Z'),
      msg(NOS, '2026-10-28T11:30:00Z', 'Olá Maria, o sofá de 3 lugares fica a 69€.'),
      msg('Maria Teste <maria@exemplo.pt>', '2026-10-28T11:45:00Z', 'Pode ser na quinta?'),
    ], AGORA, INSTALADO, 0);
    expect(d).toMatchObject({ responder: false, porResponder: true });
  });
});

describe('texto', () => {
  it('é o texto aprovado pelo dono, com o primeiro nome', () => {
    expect(gs.respostaAutomatica('Tatiana', false)).toBe([
      'Olá Tatiana,',
      '',
      'Obrigado pelo seu email, já o recebemos e respondemos-lhe por aqui.',
      '',
      'Se for um pedido de orçamento, o mais rápido é o WhatsApp: envie uma fotografia do que quer limpar e a localidade para o 925 530 647 e damos-lhe o preço e a disponibilidade em poucos minutos.',
      'https://wa.me/351925530647',
      '',
      'Com os melhores cumprimentos,',
      'António',
      'Kyro Clean Solutions',
    ].join('\n'));
  });

  it('sem nome reconhecível, só "Olá,"', () => {
    expect(gs.primeiroNome('rmcp63gmail.Com <rmcp63@exemplo.pt>')).toBe('');
    expect(gs.primeiroNome('rmcp63@exemplo.pt')).toBe('');
    expect(gs.respostaAutomatica('', false).startsWith('Olá,\n')).toBe(true);
  });

  it('o primeiro nome sai com maiúscula certa', () => {
    expect(gs.primeiroNome('"INÊS TESTE" <ines@exemplo.pt>')).toBe('Inês');
    expect(gs.primeiroNome('ana-rita teste <ar@exemplo.pt>')).toBe('Ana-Rita');
  });

  it('em inglês só quando o email vem claramente em inglês', () => {
    expect(gs.emIngles('Hello, could you please send me a quote for cleaning our sofa? Thank you')).toBe(true);
    expect(gs.emIngles('Boa tarde, gostaria de um orçamento para a limpeza do sofá. Obrigada')).toBe(false);
    expect(gs.respostaAutomatica('Johan', true)).toContain('Thank you for your email, we have received it and will reply here.');
    expect(gs.respostaAutomatica('Johan', true)).toContain('+351 925 530 647');
  });

  it('o número e o link do WhatsApp são os do site', async () => {
    const business = await import('@/constants/business');
    expect(gs.WHATSAPP).toBe(business.WHATSAPP_BASE);
    expect(gs.TELEFONE).toBe(business.PHONE_DISPLAY);
  });
});

describe('filtros dos alertas do bot', () => {
  it('as duas pesquisas são o contrário uma da outra', () => {
    expect(gs.consultaInfo()).toBe(`-${gs.consultaPrecisa()}`);
    for (const assunto of ['Responde tu', 'decides tu', 'falta isto', 'desmarcar', 'fim de semana']) {
      expect(gs.consultaPrecisa()).toContain(assunto);
    }
  });
});
