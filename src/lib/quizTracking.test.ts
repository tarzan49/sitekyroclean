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
  it('deduplicates legacy per-button tracking and records both channels',async()=>{
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
    const link=document.querySelector('a')!; link.onclick=()=>m.trackCallClickEvent('legacy');
    link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    // Um clique, um evento: o delegado global e o onclick do botao nao contam duas vezes.
    expect(fetch).toHaveBeenCalledTimes(1); expect(window.gtag).toHaveBeenCalledTimes(1);
    // Nome do evento no GA4 e `phone_click`; na tabela `quiz_events` o mesmo
    // clique continua a chamar-se `call_click`.
    expect(window.gtag).toHaveBeenCalledWith('event','phone_click',expect.objectContaining({cta_location:'page:/limpeza-sofas'}));
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).action).toBe('call_click');
    link.onclick=()=>m.trackWhatsAppClick('legacy');link.href='https://api.whatsapp.com/send?phone=000';
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
