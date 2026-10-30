import { expect, test } from "vitest";
import { botAvailability } from "@/lib/botAvailability";
const ev = (s: string, e: string, sum: string) => ({ start: s, end: e, summary: sum, description: "Equipa: Algarve", status: "confirmed" } as any);
test("Algarve 3/11 respeita estrada", () => {
  const events = [ev("2026-11-03T09:00:00Z","2026-11-03T10:00:00Z","Serviço 95€ (189€) x - 1 - T - Portimão"),
    ev("2026-11-03T14:00:00Z","2026-11-03T15:00:00Z","Serviço 1€ (2€) x - 1 - C - Conceição de Tavira 8800-082"),
    ev("2026-11-03T16:00:00Z","2026-11-03T17:00:00Z","Serviço 1€ (2€) x - 1 - D - Monte Francisco 8950-228")];
  const r: any = botAvailability({ city: "Faro", items: [{ service: "sofa", size: "canto", treatment: "clean", quantity: 1 }] } as any, events, new Date("2026-10-30T20:00:00Z"));
  console.log(JSON.stringify(r).slice(0, 600));
  expect(r.handToOwner).toBeFalsy();
  const r2: any = botAvailability({ city: "Faro", date: "2026-11-04" } as any, events, new Date("2026-10-30T20:00:00Z"));
  expect(r2.handToOwner).toBeTruthy();
});
