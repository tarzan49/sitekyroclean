// Falha passageira do Supabase (dono, 24 Nov). O supabase-js já repete os GET em
// 503, 520 e falha de rede; aqui fica só o que ele não repete: os outros erros de
// gateway, e o `is_admin`, uma leitura que ele manda por POST e que à primeira
// falha mostrava "Sem autorização". Escritas nunca se repetem.
const GATEWAY = new Set([502, 504, 521, 522, 523, 524]);
const DELAYS_MS = [500, 1500, 3000];

const isAdminCheck = (url: string) => /\/rest\/v1\/rpc\/is_admin(\?|$)/.test(url);

export function createRetryFetch(baseFetch: typeof fetch, delays: number[] = DELAYS_MS): typeof fetch {
  return async (input, init) => {
    const request = input instanceof Request ? input : null;
    const url = request ? request.url : String(input);
    const method = (init?.method ?? request?.method ?? 'GET').toUpperCase();
    // Um Request com corpo só se lê uma vez: passa direto.
    const adminCheck = method === 'POST' && isAdminCheck(url);
    const retries = !request && (adminCheck || method === 'GET' || method === 'HEAD') ? delays : [];
    for (let attempt = 0; ; attempt++) {
      const last = attempt >= retries.length || init?.signal?.aborted;
      try {
        const res = await baseFetch(input, init);
        if (last || !(GATEWAY.has(res.status) || (adminCheck && (res.status === 503 || res.status === 520)))) return res;
        await res.body?.cancel();
      } catch (e) {
        if (last || !adminCheck || init?.signal?.aborted) throw e;
      }
      await new Promise(resolve => setTimeout(resolve, retries[attempt]));
    }
  };
}
