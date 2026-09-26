import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Tests use a fake production URL with a mocked network. No real events are sent.
let cleanup: (()=>void) | undefined;
beforeEach(()=>{ vi.resetModules(); sessionStorage.clear(); localStorage.clear(); localStorage.setItem('kyro_cookie_consent','accepted'); document.body.innerHTML=''; vi.stubGlobal('location',new URL('https://cleansolutions.com.pt/limpeza-sofas?utm_source=test')); vi.stubEnv('VITE_SUPABASE_URL','https://example.invalid'); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','fake'); vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true})); window.gtag=vi.fn(); });
afterEach(()=>{cleanup?.(); cleanup=undefined;vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('all public contact links',()=>{
  it('does not send or retain analytics before consent or after refusal',async()=>{
    localStorage.removeItem('kyro_cookie_consent');
    const m=await import('./quizTracking'); cleanup=m.initContactTracking();
    m.trackCallClickEvent('before'); m.trackSessionTime(15);
    expect(fetch).not.toHaveBeenCalled(); expect(sessionStorage.length).toBe(0);
    localStorage.setItem('kyro_cookie_consent','declined');
    m.trackWhatsAppClick('declined');
    expect(fetch).not.toHaveBeenCalled(); expect(window.gtag).not.toHaveBeenCalled();
  });
  it('captures newly added buttons and nested icons without an explicit handler',async()=>{
    const m=await import('./quizTracking'); cleanup=m.initContactTracking();
    document.body.innerHTML='<a href="https://wa.me/351000000000?text=private"><span>Icon</span></a>';
    document.querySelector('span')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    expect(fetch).toHaveBeenCalledTimes(1);
    const event=JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(event.action).toBe('whatsapp_click');expect(event.utm_source).toBe('test');
    expect(JSON.stringify(event)).not.toContain('private');
  });
  it('deduplicates per-button tracking and records both channels',async()=>{
    // Fora de producao so se envia com autorizacao explicita E identificadores
    // que nao sejam os reais. O `?kyro_debug=1` deixou de servir para isto: e
    // diagnostico, nao autorizacao.
    vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION','true');
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID','G-TESTE00000');
    vi.stubEnv('VITE_GOOGLE_ADS_ID','AW-000000000');
    const {loadGoogleTags}=await import('./gtag'); loadGoogleTags();
    const m=await import('./quizTracking'); cleanup=m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML='<a href="tel:+351000000000">Call</a>';
    const link=document.querySelector('a')!;
    // Uma chamada manual deduplica **pelo evento**, que e o que o browser
    // entrega ao handler. A bandeira temporal que existia aqui antes nao
    // sobrevivia a um clique a serio — ver a suite "um clique, um evento".
    let call: Event | undefined;
    link.onclick=e=>{ call=e; m.trackCallClickEvent('legacy',undefined,e); };
    link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(call).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1); expect(window.gtag).toHaveBeenCalledTimes(1);
    // Nome do evento no GA4 e `phone_click`; na tabela `quiz_events` o mesmo
    // clique continua a chamar-se `call_click`.
    expect(window.gtag).toHaveBeenCalledWith('event','phone_click',expect.objectContaining({cta_location:'page:/limpeza-sofas'}));
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).action).toBe('call_click');
    link.onclick=e=>m.trackWhatsAppClick('legacy',undefined,e);link.href='https://api.whatsapp.com/send?phone=000';
    link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(window.gtag).toHaveBeenCalledWith('event','whatsapp_click',expect.anything());
  });

  /**
   * Sem tag carregada (consentimento nao aceite) nada sai para a Google, e sem
   * ser em producao tambem nao: sao duas portas independentes, e e a segunda
   * que impede um preview ou o localhost de poluir a conta.
   */
  it('sends nothing to Google outside production without explicit authorisation',async()=>{
    const m=await import('./quizTracking'); cleanup=m.initContactTracking();
    document.body.innerHTML='<a href="tel:+351000000000">Call</a>';
    document.querySelector('a')!.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(window.gtag).not.toHaveBeenCalled();
  });
  it('preserves attribution through navigation and excludes admin and preview',async()=>{
    const m=await import('./quizTracking');cleanup=m.initContactTracking();
    vi.stubGlobal('location',new URL('https://cleansolutions.com.pt/outra-pagina'));
    m.trackCallClickEvent('test');
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).utm_source).toBe('test');
    vi.stubGlobal('location',new URL('https://cleansolutions.com.pt/admin/panel'));m.trackCallClickEvent('admin');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

/**
 * A combinacao real: delegado global no `document` + handler do proprio
 * componente no mesmo `<a>`.
 *
 * Porque e que o teste acima ("deduplicates legacy per-button tracking") passava
 * e a producao duplicava na mesma: a guarda antiga era reposta por
 * `queueMicrotask`. Um `dispatchEvent` chamado a partir de codigo mantem a pilha
 * de JavaScript ocupada durante todo o despacho, por isso o ponto de
 * verificacao de microtarefas so corre no fim e a guarda aguenta. Num clique a
 * serio o browser invoca cada listener a partir de codigo nativo, a pilha
 * esvazia-se entre eles, as microtarefas correm, e a guarda ja esta desligada
 * quando o handler do componente corre. Medido em producao a 2026-09-18:
 * `phone_click` e `whatsapp_click` sairam dois de cada vez.
 *
 * Estes testes reproduzem essa reposicao de proposito (`await Promise.resolve()`
 * entre o delegado e o handler) e passam o mesmo objeto de evento ao handler,
 * que e o que o browser faz.
 */
describe('um clique, um evento', () => {
  const productionTags = async () => {
    vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000');
    vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000');
    const { loadGoogleTags } = await import('./gtag');
    loadGoogleTags();
  };

  it('delegado global + handler do componente contam uma vez so', async () => {
    await productionTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = '<a href="tel:+351000000000" data-tracking-source="header_desktop">Ligar</a>';
    const link = document.querySelector('a')!;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    // O ponto de verificacao de microtarefas que a guarda antiga nao sobrevivia.
    await Promise.resolve();
    // O handler do componente, com o mesmo evento que o browser lhe entrega.
    m.trackCallClickEvent('header_desktop', undefined, event);

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith('event', 'phone_click', expect.objectContaining({ cta_location: 'header_desktop' }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).action).toBe('call_click');
  });

  it('o mesmo para o WhatsApp', async () => {
    await productionTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = '<a href="https://wa.me/351000000000" data-tracking-source="header_desktop"><span>Icon</span></a>';
    const icon = document.querySelector('span')!;

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    icon.dispatchEvent(event);
    await Promise.resolve();
    m.trackWhatsAppClick('header_desktop', undefined, event);

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith('event', 'whatsapp_click', expect.objectContaining({ cta_location: 'header_desktop' }));
  });

  it('dois cliques distintos continuam a ser dois eventos', async () => {
    await productionTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = '<a href="tel:+351000000000" data-tracking-source="sticky_bar">Ligar</a>';
    const link = document.querySelector('a')!;

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('nao gera lead nem conversao de pedido confirmado', async () => {
    await productionTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = '<a href="tel:+351000000000" data-tracking-source="header_mobile">Ligar</a>';
    const link = document.querySelector('a')!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    await Promise.resolve();
    m.trackCallClickEvent('header_mobile', undefined, event);

    const names = vi.mocked(window.gtag!).mock.calls.map(call => String(call[1]));
    expect(names).not.toContain('generate_lead');
    expect(names).not.toContain('conversion');
    expect(localStorage.getItem('kyro_fired_events_v1')).toBeNull();
  });

  /**
   * A regra de `cta_location`, por ordem: o atributo declarado pelo componente,
   * depois o contentor semantico, depois o caminho da pagina.
   */
  it('cta_location: atributo, depois header/footer, depois page:', async () => {
    await productionTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = [
      '<header><a id="h" href="tel:+351000000000">Ligar</a></header>',
      '<footer><a id="f" href="tel:+351000000000">Ligar</a></footer>',
      '<a id="p" href="tel:+351000000000">Ligar</a>',
      '<header><a id="a" href="tel:+351000000000" data-tracking-source="header_desktop">Ligar</a></header>',
    ].join('');
    for (const id of ['h', 'f', 'p', 'a']) {
      document.getElementById(id)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      await Promise.resolve();
    }
    const locations = vi.mocked(window.gtag!).mock.calls.map(call => (call[2] as { cta_location?: string }).cta_location);
    expect(locations).toEqual(['header', 'footer', 'page:/limpeza-sofas', 'header_desktop']);
  });
});


describe('page views after consent', () => {
  it('records the current page once when consent is accepted after arrival', async () => {
    localStorage.removeItem('kyro_cookie_consent');
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    m.trackPageViewEvent('/limpeza-sofas-lisboa');
    expect(fetch).not.toHaveBeenCalled();
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    m.trackPageViewEvent('/limpeza-sofas-lisboa');
    m.trackPageViewEvent('/limpeza-sofas-lisboa');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)).toMatchObject({
      action: 'page_view', page_path: '/limpeza-sofas-lisboa',
    });
  });
});


describe('CTA audit matrix with mocked delivery', () => {
  it.each(['header_desktop', 'header_mobile', 'header_mobile_menu', 'hero', 'sticky_bar', 'footer', 'location_hero_limpeza-sofas_lisboa', 'quote_confirmation'])('%s survives DOM replacement and keyboard-style activation', async source => {
    vi.stubEnv('VITE_CONSENT_MODE', 'basic');
    vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000');
    vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000');
    const { loadGoogleTags } = await import('./gtag');
    loadGoogleTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    for (let i = 0; i < 2; i++) {
      document.body.innerHTML = `<a href="https://wa.me/351925530647?text=message" data-tracking-source="${source}">WhatsApp</a>`;
      const link = document.querySelector('a')!;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 0 });
      expect(link.dispatchEvent(event)).toBe(true);
      await Promise.resolve();
    }
    expect(window.gtag).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const call of vi.mocked(window.gtag!).mock.calls) {
      expect(call).toEqual(['event', 'whatsapp_click', expect.objectContaining({ cta_location: source })]);
      expect(JSON.stringify(call)).not.toContain('link_url');
      expect(JSON.stringify(call)).not.toContain('message');
    }
    localStorage.setItem('kyro_cookie_consent', 'declined');
    document.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(window.gtag).toHaveBeenCalledTimes(2);
  });
});

/**
 * Modo avançado (em vigor desde 26/09/2026): depois de recusar, a Google tag
 * continua a receber o clique como ping sem cookies, mas a medição própria em
 * `quiz_events` não recebe nada. A política de privacidade diz exatamente isto.
 */
describe('advanced consent mode and our own measurement', () => {
  it('a refused visitor reaches Google as a cookieless ping and never quiz_events', async () => {
    vi.stubEnv('VITE_CONSENT_MODE', '');
    vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
    vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000');
    vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000');
    localStorage.setItem('kyro_cookie_consent', 'declined');
    const { loadGoogleTags } = await import('./gtag');
    loadGoogleTags();
    const m = await import('./quizTracking');
    cleanup = m.initContactTracking();
    vi.mocked(window.gtag!).mockClear();
    document.body.innerHTML = '<a href="https://wa.me/351925530647" data-tracking-source="hero">WhatsApp</a>';
    document.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await Promise.resolve();
    expect(window.gtag).toHaveBeenCalledWith('event', 'whatsapp_click', expect.objectContaining({ cta_location: 'hero' }));
    expect(fetch).not.toHaveBeenCalled();
  });
});
