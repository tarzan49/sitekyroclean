import { describe, expect, it } from "vitest";
import { computeServiceCloseRates, servicesFromLabels } from "./crmServiceCloseRate";
import { summarizeQuizLeads, type QuizLeadRow, type QuizServiceRow } from "./crmQuizLeads";

const service = (phone: string, booked: string): QuizServiceRow & { calendar_missing_since: null } => ({
  id: phone + booked, booked_at: booked, created_at: booked, request_date: booked.slice(0, 10), billed_value: 100, my_cut: 50,
  upsell_value: null, upsell_team: null, locality: null, phone, client_name: null, calendar_missing_since: null,
});
const lead = (id: string, phone: string, svc: string, at: string, whatsapp_phone: string | null = null): QuizLeadRow => ({
  id, created_at: at, name: "Ana Silva", phone, service: svc, location: null, value: null, source: "Website", whatsapp_phone,
});

describe("servicesFromLabels", () => {
  it("maps WhatsApp labels to the Serviços tab names", () => {
    expect(servicesFromLabels(["Sofá"])).toEqual(["Limpeza de sofá"]);
    expect(servicesFromLabels(["Sofá", "Cadeira", "Impermeabilização"])).toEqual(["Impermeabilização de sofá", "Impermeabilização de cadeiras"]);
    expect(servicesFromLabels(["Impermeabilização"])).toEqual(["Impermeabilização de sofá"]);
    expect(servicesFromLabels(["Tapete", "Recolha"])).toEqual(["Limpeza de tapete"]);
    expect(servicesFromLabels(["Tapete", "Impermeabilização"])).toEqual(["Limpeza de tapete", "Impermeabilização de sofá"]);
    expect(servicesFromLabels(["Porto"])).toEqual([]);
  });
});

describe("computeServiceCloseRates", () => {
  const services = [service("912345671", "2026-10-05T10:00:00Z"), service("912345672", "2026-10-08T10:00:00Z")];
  const quiz = summarizeQuizLeads([
    lead("a", "912345671", "Sofá, 1x Colchão Casal", "2026-10-02T10:00:00Z"),
    lead("b", "912345679", "Tapete", "2026-10-03T10:00:00Z"),
  ], services);
  const contacts = [
    // Já contado pelo questionário: não entra outra vez.
    { phone: "351912345671", first_contact_at: "2026-10-02T10:05:00Z", status: "cliente", services: ["Sofá"] },
    { phone: "912345672", first_contact_at: "2026-10-04T10:00:00Z", status: "por_marcar", services: ["Sofá", "Impermeabilização"] },
    { phone: "912345673", first_contact_at: "2026-10-06T10:00:00Z", status: "marcado", services: ["Sofá"] },
    { phone: "912345674", first_contact_at: "2026-10-07T10:00:00Z", status: "por_marcar", services: [] },
    { phone: "912345675", first_contact_at: "2026-09-20T10:00:00Z", status: "cliente", services: ["Sofá"] },
  ];
  const r = computeServiceCloseRates("2026-10", quiz, contacts, services);

  it("counts each person once across channels, in the month of the first request", () => {
    expect(r.total).toEqual({ quotes: 5, closed: 3 });
    expect(r.quiz).toEqual({ quotes: 2, closed: 1 });
    expect(r.whatsApp).toEqual({ quotes: 3, closed: 2 });
    expect(r.withoutService).toBe(1);
  });

  it("splits by service", () => {
    expect(r.byService.get("Limpeza de sofá")).toEqual({ quotes: 2, closed: 2 });
    expect(r.byService.get("Limpeza de colchão")).toEqual({ quotes: 1, closed: 1 });
    expect(r.byService.get("Limpeza de tapete")).toEqual({ quotes: 1, closed: 0 });
    expect(r.byService.get("Impermeabilização de sofá")).toEqual({ quotes: 1, closed: 1 });
  });
});
