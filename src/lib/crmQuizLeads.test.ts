import { describe, expect, it } from "vitest";
import { summarizeQuizLeads, summarizeWhatsAppContacts, type QuizLeadRow, type QuizServiceRow } from "./crmQuizLeads";

// Dados inventados: o repositório é público.
const lead = (id: string, created_at: string, phone: string | null, source: string | null = "Website"): QuizLeadRow =>
  ({ id, created_at, phone, source, name: null, service: null, location: null, value: null });
const service = (id: string, booked_at: string, phone: string, billed = 100, my_cut = 50): QuizServiceRow =>
  ({ id, booked_at, created_at: booked_at, request_date: booked_at.slice(0, 10), billed_value: billed, my_cut, upsell_value: null, upsell_team: null, locality: "Porto", phone });

describe("summarizeQuizLeads", () => {
  it("links a quiz request to a later CRM service by the last 9 phone digits", () => {
    const s = summarizeQuizLeads(
      [lead("a", "2026-09-20T10:00:00Z", "+351 912 000 001")],
      [service("s1", "2026-09-21T09:00:00Z", "912000001", 99, 50)],
    );
    expect(s.people).toHaveLength(1);
    expect(s.people[0].services.map(x => x.id)).toEqual(["s1"]);
    expect(s.months).toEqual([{ month: "2026-09", people: 1, closed: 1, billed: 99, share: 50 }]);
    expect(s.quizServiceIds.has("s1")).toBe(true);
  });

  it("counts a person once, on the first request", () => {
    const s = summarizeQuizLeads(
      [lead("a", "2026-10-02T10:00:00Z", "912000001"), lead("b", "2026-09-29T10:00:00Z", "+351912000001")],
      [],
    );
    expect(s.people).toHaveLength(1);
    expect(s.people[0].firstDay).toBe("2026-09-29");
    expect(s.months).toEqual([{ month: "2026-09", people: 1, closed: 0, billed: 0, share: 0 }]);
  });

  it("does not credit the quiz with a service closed before the request", () => {
    const s = summarizeQuizLeads(
      [lead("a", "2026-09-30T10:00:00Z", "912000001")],
      [service("old", "2026-09-10T09:00:00Z", "912000001")],
    );
    expect(s.people[0].services).toEqual([]);
    expect(s.quizServiceIds.size).toBe(0);
  });

  it("ignores WhatsApp bot leads and counts requests without a phone apart", () => {
    const s = summarizeQuizLeads(
      [lead("w", "2026-09-30T10:00:00Z", "912000001", "WhatsApp"), lead("n", "2026-09-30T10:00:00Z", null)],
      [service("s", "2026-10-01T09:00:00Z", "912000001")],
    );
    expect(s.people).toEqual([]);
    expect(s.withoutPhone).toBe(1);
  });
});

describe("summarizeQuizLeads: other ways to link", () => {
  it("links through the WhatsApp number that sent the order code", () => {
    const l = { ...lead("a", "2026-10-06T10:00:00Z", "939000001"), whatsapp_phone: "932000002" };
    const s = summarizeQuizLeads([l], [service("s", "2026-10-06T12:00:00Z", "+351 932 000 002", 119, 60)]);
    expect(s.people[0].matchedBy).toEqual(["WhatsApp"]);
    expect(s.months[0]).toMatchObject({ people: 1, closed: 1, billed: 119 });
  });

  it("falls back to the full name when the CRM phone is wrong", () => {
    const l = { ...lead("a", "2026-09-17T10:00:00Z", "969000001"), name: "Hugo Gomes" };
    const s = summarizeQuizLeads([l], [
      { ...service("s", "2026-09-17T12:00:00Z", "925000009", 130, 65), client_name: "Hugo Gomes" },
      { ...service("x", "2026-09-18T12:00:00Z", "925000008"), client_name: "Hugo" },
    ]);
    expect(s.people[0].services.map(x => x.id)).toEqual(["s"]);
    expect(s.people[0].matchedBy).toEqual(["nome"]);
  });

  it("leaves test requests out", () => {
    const s = summarizeQuizLeads([
      { ...lead("t", "2026-09-18T10:00:00Z", "925000009"), name: "TESTE GOOGLE ADS" },
      lead("f", "2026-09-18T10:00:00Z", "911111111"),
      lead("z", "2026-09-24T10:00:00Z", "910000000"),
    ], []);
    expect(s.people).toEqual([]);
    expect(s.tests).toBe(3);
  });
});

describe("summarizeWhatsAppContacts", () => {
  it("counts WhatsApp contacts outside the quiz, closed by label or by a CRM service", () => {
    const quiz = summarizeQuizLeads([{ ...lead("a", "2026-09-20T10:00:00Z", "912000001"), whatsapp_phone: "932000009" }], []);
    const months = summarizeWhatsAppContacts([
      { phone: "351912000001", first_contact_at: "2026-09-20T10:00:00Z", status: "pendente" },
      { phone: "351932000009", first_contact_at: "2026-09-20T10:00:00Z", status: "cliente" },
      { phone: "351913000002", first_contact_at: "2026-09-21T10:00:00Z", status: "marcado" },
      { phone: "351913000003", first_contact_at: "2026-09-22T10:00:00Z", status: "pendente" },
      { phone: "351913000004", first_contact_at: "2026-10-01T10:00:00Z", status: "pendente" },
      { phone: "351913000005", first_contact_at: null, status: "cliente" },
    ], [service("s", "2026-10-02T10:00:00Z", "913000004")], quiz);
    expect(months).toEqual([
      { month: "2026-10", contacts: 1, closed: 1 },
      { month: "2026-09", contacts: 2, closed: 1 },
    ]);
  });
});
