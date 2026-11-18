import { expect, test } from "vitest";
import { botAvailability } from "@/lib/botAvailability";
const ev = (s: string, e: string, sum: string) => ({ start: s, end: e, summary: sum, description: "Equipa: Algarve", status: "confirmed" } as any);
// Dono, 18 Nov 2026: "No Algarve podes fechar, mas [...] nunca dizer horários no Algarve". Os dias do bot no Algarve acabaram.
test("Algarve: o bot nunca dá horas (askWeek); a hora dada pelo dono respeita a estrada", () => {
  const events = [ev("2026-11-03T09:00:00Z","2026-11-03T10:00:00Z","Serviço 95€ (189€) x - 1 - T - Portimão"),
    ev("2026-11-03T14:00:00Z","2026-11-03T15:00:00Z","Serviço 1€ (2€) x - 1 - C - Conceição de Tavira 8800-082"),
    ev("2026-11-03T16:00:00Z","2026-11-03T17:00:00Z","Serviço 1€ (2€) x - 1 - D - Monte Francisco 8950-228")];
  const now = new Date("2026-10-30T20:00:00Z");
  const r: any = botAvailability({ city: "Faro", items: [{ service: "sofa", size: "canto", treatment: "clean", quantity: 1 }] } as any, events, now);
  expect([r.askWeek, r.free, r.suggestion]).toEqual([true, [], null]);
  expect(botAvailability({ city: "Faro", date: "2026-11-03" } as any, events, now)).toMatchObject({ askWeek: true, free: [] });
  // Portimão 9h-10h and Conceição de Tavira at 14h: Faro at 10h has no road time left, 11h30 does.
  const tight: any = botAvailability({ city: "Faro", date: "2026-11-03", time: "10h", ownerTime: true } as any, events, now);
  const roomy: any = botAvailability({ city: "Faro", date: "2026-11-03", time: "11h30", ownerTime: true } as any, events, now);
  expect([tight.askWeek, tight.requested.free, roomy.requested.free]).toEqual([undefined, false, true]);
});
