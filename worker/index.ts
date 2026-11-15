// Worker do site (substitui o Cloudflare Pages desde 16/11/2026: o Pages só
// aceita 20.000 ficheiros; os Workers com o plano pago aceitam 100.000).
// Faz o mesmo que functions/_middleware.ts fazia no Pages: no admin, "/" vai
// para o painel. O resto são os ficheiros de dist/.
interface Env { ASSETS: { fetch: (req: Request) => Promise<Response> } }

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname === "admin.cleansolutions.com.pt" && url.pathname === "/") {
      return Response.redirect(`${url.origin}/admin/panel`, 302);
    }
    return env.ASSETS.fetch(request);
  },
};
