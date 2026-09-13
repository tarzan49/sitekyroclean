import { createServer } from 'vite';

// Local design pilot only. This plugin is never loaded by the production build.
const route = '/limpeza-sofas-porto';
const css = `
:root{
  --pilot-green:#12372c;
  --pilot-green-deep:#102b23;
  --pilot-paper:#f4f7f4;
  --pilot-surface:radial-gradient(ellipse at 90% 0%,rgba(93,154,122,.16),transparent 65%),linear-gradient(155deg,#173e31 0%,#12372c 48%,#102b23 100%);
}
.bg-kyro-green,.bg-checker-dark,.bg-checker-modal{
  background:var(--pilot-surface)!important;
}
section[class*="bg-[#071a12]"]{background:var(--pilot-surface)!important}
section[class*="bg-[#FDFDF9]"]{background:var(--pilot-paper)!important}
[data-problem-id]{background:var(--pilot-surface)!important;border-radius:12px;border-color:#294d3d;box-shadow:0 8px 24px #102b230a}
#precos .bg-checker-modal{border-radius:14px;border-color:#ffffff20;box-shadow:0 12px 32px #102b2310}
#avaliacoes figure{background:#f4f7f2;border-color:#ffffff18;border-radius:12px;box-shadow:none}
#processo>.max-w-7xl>div{border-radius:12px;box-shadow:0 6px 24px #102b2306}
[data-landing-section="duvidas"] button,[data-landing-section="faq"] button{border-radius:8px}
@media(max-width:767px){
  [data-commercial-hero]{background:radial-gradient(ellipse 120% 65% at 100% 8%,rgba(112,177,139,.17),transparent 72%),linear-gradient(170deg,#183f32 0%,#12372c 55%,#102b23 100%);padding-top:88px!important}
  [data-commercial-hero]>picture,[data-commercial-hero]>div[aria-hidden]{display:none}
  [data-commercial-hero]>div.mx-auto{padding-bottom:24px}
  [data-commercial-hero]>.mx-auto>.grid{gap:28px}
  [data-hero-part="breadcrumb"]{font-size:12px;gap:6px;margin-bottom:18px;color:#c0d0c5}
  [data-hero-part="breadcrumb"] a{min-height:44px}
  [data-hero-part="title"]{font-size:32px;line-height:1.14;letter-spacing:-.025em;text-shadow:none!important;max-width:24ch}
  [data-hero-part="subtitle"]{font-size:16px;line-height:1.6;color:#d0dad3;margin-top:16px;margin-bottom:24px;text-shadow:none!important}
  [data-hero-part="whatsapp"]{min-height:54px;font-size:15px;background:linear-gradient(135deg,#188344,#13753b);border:1px solid #ffffff12;border-radius:10px;padding:14px 10px;box-shadow:0 5px 16px #061b1312}
  [data-hero-part="prices"]{min-height:48px;font-size:14px;margin-top:4px}
  [data-hero-part="prices"]+p{font-size:13px;line-height:1.6;color:#c4d0c8;text-align:center;margin-top:4px}
  [data-hero-part="comparison"]>div{border-top:0}
  [data-hero-part="comparison"] [role="region"]>div:first-child{border-radius:12px;overflow:hidden;box-shadow:0 8px 24px #061b131a}
  [data-hero-part="comparison"] [role="region"]>div:nth-child(2){padding-top:12px;padding-bottom:8px;gap:0}
  [data-hero-part="comparison"] [aria-label="Reproduzir galeria"],
  [data-hero-part="comparison"] [aria-label="Pausar galeria"]{display:none}
  [data-hero-part="comparison"] [aria-label="Escolher exemplo"]{gap:8px;padding-bottom:0}
  [data-hero-part="comparison"] [aria-label="Escolher exemplo"] button{border-radius:6px}
  [data-hero-part="comparison"] .text-gold{color:#D4AF37}
  [data-hero-part="stats"]{background:transparent}
  [data-hero-part="stats"] section{border-color:#ffffff0f}
  [data-hero-part="stats"] .grid{padding-top:24px;padding-bottom:24px}
  [data-hero-part="stats"] .grid>div>p{font-size:12px;line-height:1.4}
  [data-commercial-hero]~*{scroll-margin-top:80px}
  [data-landing-section="precos"]{background:var(--pilot-green-deep)}
  [data-landing-section="precos"]>section{border-radius:24px 24px 0 0}
  [data-landing-section]>section{padding-top:48px;padding-bottom:48px}
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
