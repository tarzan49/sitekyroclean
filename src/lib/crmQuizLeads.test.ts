import { describe, expect, it } from "vitest";
import { summarizeQuizLeads, type QuizLeadRow, type QuizServiceRow } from "./crmQuizLeads";

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
