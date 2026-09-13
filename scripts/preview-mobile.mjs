import { createServer } from 'vite';

const materials = [
  ['sofa-tecido', 'Sofá em tecido'], ['sofa-veludo', 'Sofá em veludo'],
  ['sofa-pele', 'Sofá em pele'], ['sofa-microfibra', 'Sofá em microfibra'],
  ['sofa-linho', 'Sofá em linho'], ['sofa-camurca', 'Sofá em camurça'],
  ['sofa-sintetico', 'Sofá sintético'], ['tapete-la', 'Tapete de lã'],
  ['tapete-persa', 'Tapete persa'], ['tapete-sintetico', 'Tapete sintético'],
  ['tapete-sisal', 'Tapete de sisal/juta'],
];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const server = await createServer({
  server: { host: '127.0.0.1', port: 8086, strictPort: true },
  plugins: [{
    name: 'local-mobile-preview',
    apply: 'serve',
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname !== '/__mobile') return next();
        const input = url.searchParams.get('path') || '/limpeza-sofa-tecido#material';
        const route = input.startsWith('/') && !input.startsWith('//') && !input.includes('\\') && !input.startsWith('/__mobile') ? input : '/limpeza-sofa-tecido#material';
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Materiais | Preview mobile</title><style>*{box-sizing:border-box}html,body{margin:0;height:100%;background:#18191b;color:#eee;font:14px system-ui}body{display:flex;justify-content:center}.phone{width:390px;max-width:100%;height:100dvh;max-height:920px;display:flex;flex-direction:column}label{display:flex;align-items:center;gap:10px;padding:8px 12px;min-height:52px}select{flex:1;min-width:0;min-height:44px;background:#272a28;color:white;border:1px solid #666;padding:5px}iframe{width:100%;min-height:0;flex:1;border:0;background:white}</style></head><body><div class="phone"><label>Material<select aria-label="Escolher material"><option value="">Selecionar...</option>${materials.map(([slug,name])=>`<option value="/limpeza-${slug}#material" ${route.startsWith('/limpeza-'+slug+'#')?'selected':''}>${name}</option>`).join('')}</select></label><iframe title="Página em formato mobile" src="${escape(route)}"></iframe></div><script>const frame=document.querySelector('iframe');frame.addEventListener('load',()=>{const doc=frame.contentDocument;if(!doc)return;const scrollToSection=()=>{const section=doc.getElementById(frame.contentWindow.location.hash.slice(1)||'material');if(!section)return false;Promise.all([doc.fonts.ready,...Array.from(doc.images).filter(image=>image.loading!=='lazy').map(image=>image.decode().catch(()=>{}))]).then(()=>setTimeout(()=>section.scrollIntoView({block:'start'}),150));return true;};if(!scrollToSection()){const observer=new MutationObserver(()=>{if(scrollToSection())observer.disconnect();});observer.observe(doc,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),15000);}});document.querySelector('select').addEventListener('change',event=>{if(event.target.value)location.href='/__mobile?path='+encodeURIComponent(event.target.value)});</script></body></html>`);
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [{
          tag: 'script', injectTo: 'head-prepend',
          children: `if(window.top===window.self){document.documentElement.style.visibility='hidden';location.replace('/__mobile?path='+encodeURIComponent(location.pathname+location.search+location.hash));}`,
        }];
      },
    },
  }],
});
await server.listen();
server.printUrls();
