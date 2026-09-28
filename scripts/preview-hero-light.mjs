import { createServer } from 'vite';
import { readFileSync } from 'node:fs';

// Isolated local design preview. This plugin is not imported by vite.config.ts.
const css = readFileSync(new URL('./hero-light-preview/effect.css', import.meta.url), 'utf8');
const shell = `<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kyro · Tecido de luz</title><style>
*{box-sizing:border-box}body{margin:0;background:#0c1713;color:#eef5f0;font:14px system-ui}header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 28px;border-bottom:1px solid #ffffff12}h1{font-size:17px;font-weight:500;margin:0 0 6px}p{color:#b3c1b8;font-size:12px;margin:0;line-height:1.6}nav{display:flex;gap:8px;flex-wrap:wrap}button,select{font:inherit;color:#dce8df;background:#ffffff07;border:1px solid #ffffff25;padding:11px 15px;border-radius:8px;cursor:pointer}button[aria-pressed=true]{border-color:#d4af37;background:#d4af3717;color:#f1d884}main{display:flex;justify-content:center;padding:22px 12px 0}.phone{width:390px;max-width:100%;height:calc(100dvh - 133px);min-height:500px;border:1px solid #ffffff25;border-radius:22px 22px 0 0;overflow:hidden;box-shadow:0 0 80px #0005}iframe{width:100%;height:100%;border:0;background:#12372c;display:block}@media(max-width:650px){header{align-items:flex-start;flex-direction:column;padding:14px 16px;gap:12px}nav{gap:6px}button,select{padding:10px;font-size:12px}main{padding-top:12px}.phone{height:calc(100dvh - 157px);min-height:420px}}
</style></head><body><header><div><h1>Kyro · Tecido de luz</h1><p>Conceito local · luz em movimento sobre o verde da marca</p></div><nav aria-label="Controlos da proposta"><select id="page" aria-label="Página"><option value="/">Página inicial</option><option value="/limpeza-sofas">Sofás</option><option value="/limpeza-colchoes">Colchões</option><option value="/limpeza-cadeiras">Cadeiras</option><option value="/limpeza-tapetes">Tapetes</option><option value="/limpeza-alcatifas">Alcatifas</option><option value="/impermeabilizacao" selected>Impermeabilização</option><option value="/limpeza-sofas-porto">Sofás no Porto</option><option value="/limpeza-sofas-lisboa">Sofás em Lisboa</option></select><button id="original" aria-pressed="false">Atual</button><button id="proposed" aria-pressed="true">Tecido de luz</button><button id="pause" aria-pressed="false">Pausar luz</button><select id="width" aria-label="Largura do telemóvel"><option>360</option><option selected>390</option><option>430</option></select></nav></header><main><div class="phone"><iframe title="Pré-visualização mobile da página selecionada" src="/impermeabilizacao"></iframe></div></main><script>
const frame=document.querySelector('iframe');let enabled=true,paused=false;
function update(){const root=frame.contentDocument?.documentElement;if(!root)return;root.dataset.lightPreview=enabled?'on':'off';root.dataset.lightPaused=String(paused);document.querySelector('#original').setAttribute('aria-pressed',String(!enabled));document.querySelector('#proposed').setAttribute('aria-pressed',String(enabled));document.querySelector('#pause').setAttribute('aria-pressed',String(paused));document.querySelector('#pause').textContent=paused?'Retomar luz':'Pausar luz'}
document.querySelector('#page').onchange=e=>{frame.src=e.target.value};frame.addEventListener('load',update);document.querySelector('#original').onclick=()=>{enabled=false;update()};document.querySelector('#proposed').onclick=()=>{enabled=true;update()};document.querySelector('#pause').onclick=()=>{paused=!paused;update()};document.querySelector('#width').onchange=e=>document.querySelector('.phone').style.width=e.target.value+'px';
</script></body></html>`;
const server = await createServer({
  server: { host: '127.0.0.1', port: 8097, strictPort: true },
  plugins: [{
    name: 'local-hero-light', apply: 'serve',
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (new URL(req.url, 'http://localhost').pathname !== '/__hero-light') return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(shell);
      });
    },
    transformIndexHtml: {
      order: 'post', handler() { return [
        {tag:'style',injectTo:'head',children:css},
        {tag:'script',injectTo:'head-prepend',children:`document.documentElement.dataset.lightPreview='on';if(window.top===window.self)location.replace('/__hero-light');`},
      ]; },
    },
  }],
});
await server.listen();
console.log('Tecido de luz: http://127.0.0.1:8097/__hero-light');
