import { createServer } from 'vite';

// Local design pilot only. This plugin is never loaded by the production build.
const route = '/limpeza-sofas-porto';
const css = `
@media(max-width:767px){
  [data-commercial-hero]{background:#071a12;padding-top:88px!important}
  [data-commercial-hero]>picture,[data-commercial-hero]>div[aria-hidden]{display:none}
  [data-commercial-hero]>div.mx-auto{padding-bottom:24px}
  [data-commercial-hero]>.mx-auto>.grid{gap:28px}
  [data-hero-part="breadcrumb"]{font-size:12px;gap:6px;margin-bottom:18px;color:#b7c5bc}
  [data-hero-part="breadcrumb"] a{min-height:44px}
  [data-hero-part="title"]{font-size:32px;line-height:1.14;letter-spacing:-.025em;text-shadow:none!important;max-width:24ch}
  [data-hero-part="subtitle"]{font-size:16px;line-height:1.6;color:#d0dad3;margin-top:16px;margin-bottom:24px;text-shadow:none!important}
  [data-hero-part="whatsapp"]{min-height:54px;font-size:15px;background:#16833e;border-radius:4px;padding:14px 10px}
  [data-hero-part="prices"]{min-height:48px;font-size:14px;margin-top:4px}
  [data-hero-part="prices"]+p{font-size:13px;line-height:1.6;color:#c4d0c8;text-align:center;margin-top:4px}
  [data-hero-part="comparison"]>div{border-top:0}
  [data-hero-part="comparison"] [role="region"]>div:first-child{border-radius:4px;overflow:hidden}
  [data-hero-part="comparison"] [role="region"]>div:nth-child(2){padding-top:12px;padding-bottom:8px;gap:0}
  [data-hero-part="comparison"] [aria-label="Reproduzir galeria"],
  [data-hero-part="comparison"] [aria-label="Pausar galeria"]{display:none}
  [data-hero-part="comparison"] [aria-label="Escolher exemplo"]{gap:8px;padding-bottom:0}
  [data-hero-part="comparison"] [aria-label="Escolher exemplo"] button{border-radius:2px}
  [data-hero-part="comparison"] .text-gold{color:#D4AF37}
  [data-hero-part="stats"]{background:#071a12}
  [data-hero-part="stats"] section{border-color:#ffffff14}
  [data-hero-part="stats"] .grid{padding-top:24px;padding-bottom:24px}
  [data-hero-part="stats"] .grid>div>p{font-size:12px;line-height:1.4}
  [data-commercial-hero]~*{scroll-margin-top:80px}
}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}
`;

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
      handler(_html, context) {
        const requestedPath = new URL(context.originalUrl ?? context.path, 'http://localhost').pathname;
        return [
          { tag: 'script', injectTo: 'head-prepend', children: `if(window.top===window.self){document.documentElement.style.visibility='hidden';location.replace('/__hero-mobile');}` },
          ...(requestedPath === route ? [{ tag: 'style', injectTo: 'head', children: css }] : []),
        ];
      },
    },
  }],
});
await server.listen();
console.log('Hero mobile: http://127.0.0.1:8093/__hero-mobile');
