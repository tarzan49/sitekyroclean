import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// Tests use a fake production URL with a mocked network. No real events are sent.
let cleanup: (()=>void) | undefined;
beforeEach(()=>{ vi.resetModules(); sessionStorage.clear(); localStorage.clear(); document.body.innerHTML=''; vi.stubGlobal('location',new URL('https://cleansolutions.com.pt/limpeza-sofas?utm_source=test')); vi.stubEnv('VITE_SUPABASE_URL','https://example.invalid'); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY','fake'); vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true})); window.gtag=vi.fn(); });
afterEach(()=>{cleanup?.(); cleanup=undefined;vi.unstubAllGlobals();vi.unstubAllEnvs();});
describe('all public contact links',()=>{
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
    const m=await import('./quizTracking'); cleanup=m.initContactTracking();
    document.body.innerHTML='<a href="tel:+351000000000">Call</a>';
    const link=document.querySelector('a')!; link.onclick=()=>m.trackCallClickEvent('legacy');
    link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(fetch).toHaveBeenCalledTimes(1); expect(window.gtag).toHaveBeenCalledTimes(1);
    link.onclick=()=>m.trackWhatsAppClick('legacy');link.href='https://api.whatsapp.com/send?phone=000';
    link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
    expect(fetch).toHaveBeenCalledTimes(2);
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
