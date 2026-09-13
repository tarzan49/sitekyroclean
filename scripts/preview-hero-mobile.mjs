import { createServer } from 'vite';

// Local design pilot only. This plugin is never loaded by the production build.
const route = '/limpeza-sofas-porto';


const server = await createServer({
  server: { host: '127.0.0.1', port: 8093, strictPort: true },
  plugins: [{
    name: 'local-hero-mobile-pilot',
    apply: 'serve',
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (new URL(req.url, 'http://localhost').pathname !== '/__hero-mobile') return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(`<!doctype html><html lang="pt"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hero mobile | Sofás no Porto</title><style>
          *{box-sizing:border-box}html,body{margin:0;height:100%;background:#181c1a;color:#eef2ef;font:14px system-ui}body{display:flex;flex-direction:column;align-items:center}header{width:100%;padding:12px 16px;display:flex;gap:12px;justify-content:center;align-items:center;flex-wrap:wrap;border-bottom:1px solid #ffffff15}label{display:flex;align-items:center;gap:8px;color:#c2cbc5}select{min-height:44px;background:#27352d;color:white;border:1px solid #58695e;border-radius:5px;padding:8px}main{width:390px;max-width:100%;flex:1;min-height:0;background:white}iframe{width:100%;height:100%;border:0;display:block}span{color:#c2cbc5;font-size:12px}
          </style></head><body><header><div>Proposta de hero mobile<br><span>Sofás no Porto · exemplo local</span></div><label>Largura<select aria-label="Largura do telemóvel"><option value="360">360 px</option><option value="390" selected>390 px</option><option value="430">430 px</option></select></label></header><main><iframe title="Limpeza de sofás no Porto em mobile" src="${route}"></iframe></main><script>document.querySelector('select').addEventListener('change',event=>{document.querySelector('main').style.width=event.target.value+'px'});</script></body></html>`);
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          { tag: 'script', injectTo: 'head-prepend', children: `if(window.top===window.self){document.documentElement.style.visibility='hidden';location.replace('/__hero-mobile');}` },
        ];
      },
    },
  }],
});
await server.listen();
console.log('Hero mobile: http://127.0.0.1:8093/__hero-mobile');
