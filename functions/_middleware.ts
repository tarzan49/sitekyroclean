// Cloudflare Pages Function — corre antes dos assets estáticos, em todos os
// domínios do mesmo deploy. O redirect é condicionado ao Host porque
// admin.cleansolutions.com.pt e cleansolutions.com.pt servem o mesmo build;
// um _redirects normal não sabe distinguir domínios (aplicava-se aos dois).
export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === "admin.cleansolutions.com.pt" && url.pathname === "/") {
    return Response.redirect(`${url.origin}/admin/panel`, 302);
  }
  return context.next();
};
