// Dados inventados: o repositório é público.
import { describe, expect, it } from "vitest";
import { buildWeeklyReview, computeWeeklyReview, isReviewDay, mondayOf } from "./weeklyReview";
import type { ServiceRow } from "./googleAdsResults";

const svc = (over: Partial<ServiceRow>): ServiceRow => ({
  id: Math.random().toString(36), booked_at: null, created_at: "2026-10-01T10:00:00Z", request_date: "2026-10-10",
  billed_value: 100, my_cut: 50, upsell_value: null, upsell_team: null, locality: "Lisboa", phone: null,
  source: "WhatsApp", client_name: null, description: "Sofá", ...over,
});

// Segunda-feira, 12/10/2026, 9h em Lisboa.
const NOW = new Date("2026-10-12T08:00:00Z");

describe("weekly review", () => {
  it("only on Mondays, Lisbon time", () => {
    expect(isReviewDay(NOW)).toBe(true);
    expect(isReviewDay(new Date("2026-10-13T08:00:00Z"))).toBe(false);
    // Domingo 23h30 UTC já é segunda à 0h30 em Lisboa (hora de verão).
    expect(isReviewDay(new Date("2026-10-11T23:30:00Z"))).toBe(true);
    expect(mondayOf("2026-10-11")).toBe("2026-10-05");
  });

  it("counts complete weeks by close day, with Google cost per client", () => {
    const weeks = computeWeeklyReview({
      services: [
        svc({ booked_at: "2026-10-06T10:00:00Z", billed_value: 120, my_cut: 60, source: "Google Ads" }),
        svc({ booked_at: "2026-10-11T22:30:00Z", billed_value: 80, my_cut: 40, phone: "+351 910 000 002" }),
        // Domingo 23h30 UTC = segunda em Lisboa: conta na semana de 12/10, que ainda não acabou.
        svc({ booked_at: "2026-10-11T23:30:00Z" }),
        // Evento apagado no calendário: não é fecho.
        svc({ booked_at: "2026-10-07T10:00:00Z", calendar_missing_since: "2026-10-08T10:00:00Z" }),
        svc({ booked_at: "2026-09-29T10:00:00Z", billed_value: 200, my_cut: 100, upsell_value: 30, upsell_team: "Lisboa 1" }),
      ],
      clients: [{ phone: "351910000002", from_google_ads: true, first_contact_at: null, status: "cliente" }],
      adsStats: [{ stat_date: "2026-10-05", cost: 40 }, { stat_date: "2026-10-11", cost: 20 }, { stat_date: "2026-10-12", cost: 99 }],
    }, NOW);
    expect(weeks.map(w => w.week)).toEqual(["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-22", "2026-09-29", "2026-10-06"].map(d => mondayOf(d)));
    const last = weeks[5];
    expect(last).toMatchObject({ week: "2026-10-05", closes: 2, billed: 200, share: 100, ticket: 100, spend: 60, googleCloses: 2, costPerGoogleClient: 30 });
    // Upsell de 30€ em Lisboa: 9€ para o dono.
    expect(weeks[4]).toMatchObject({ closes: 1, share: 109, spend: 0, costPerGoogleClient: null });
    expect(weeks[0]).toMatchObject({ closes: 0, ticket: null });
  });

  it("writes the four numbers, the table and the 30 minutes", () => {
    const weeks = computeWeeklyReview({ services: [svc({ booked_at: "2026-10-06T10:00:00Z" })], clients: [], adsStats: [{ stat_date: "2026-10-06", cost: 50 }] }, NOW);
    const { html, text } = buildWeeklyReview(weeks);
    expect(text).toContain("semana de 05/10 a 11/10");
    expect(text).toContain("Fechos: 1 (+1 que na anterior)");
    expect(text).toContain("Ticket médio: 100€");
    expect(text).toContain("nenhum cliente com 50€ gastos");
    expect(text).toContain("Avaliações novas");
    expect(html).toContain("<table");
    expect(html).not.toContain("—");
    expect(text).not.toContain("—");
  });
});

describe("service ranking", () => {
  it("ranks services by close rate, with ticket and value per contact", async () => {
    const { computeServiceRanking, buildWeeklyReview } = await import("./weeklyReview");
    const c = (i: number, services: string[], status: string, at = "2026-09-20T10:00:00Z") =>
      ({ phone: `35191000${String(i).padStart(4, "0")}`, status, services, first_contact_at: at });
    const clients = [
      ...Array.from({ length: 10 }, (_, i) => c(i, ["Sofá"], i < 5 ? "cliente" : "por_marcar")),
      ...Array.from({ length: 10 }, (_, i) => c(100 + i, ["colchão"], i < 8 ? "marcado" : "nao_interessado")),
      // Tem serviço no CRM: fechou, mesmo com a etiqueta para trás.
      c(200, ["Cadeira"], "por_marcar"),
      // Fora da janela de 90 dias.
      c(300, ["Sofá"], "cliente", "2026-05-01T10:00:00Z"),
    ];
    const services = [
      svc({ booked_at: "2026-09-25T10:00:00Z", description: "Limpeza sofá 3 lugares", billed_value: 80 }),
      svc({ booked_at: "2026-09-25T10:00:00Z", description: "Limpeza colchão casal", billed_value: 60 }),
      svc({ booked_at: "2026-09-25T10:00:00Z", description: "Sofá e colchão", billed_value: 500 }),
      svc({ booked_at: "2026-09-25T10:00:00Z", description: "Limpeza 4 cadeiras", billed_value: 50, phone: "+351 910 000 200" }),
    ];
    const ranking = computeServiceRanking({ services, clients }, NOW);
    expect(ranking.map(r => r.service)).toEqual(["Colchão", "Sofá", "Cadeira"]);
    expect(ranking[0]).toMatchObject({ contacts: 10, closed: 8, rate: 0.8, ticket: 60, valuePerContact: 48 });
    expect(ranking[1]).toMatchObject({ contacts: 10, closed: 5, ticket: 80, valuePerContact: 40 });
    expect(ranking[2]).toMatchObject({ contacts: 1, closed: 1 });
    const { text } = buildWeeklyReview(computeWeeklyReview({ services: [], clients: [], adsStats: [] }, NOW), ranking);
    expect(text).toContain("Maior taxa: Colchão (80%). Mais dinheiro por conversa: Colchão (48€).");
    expect(text).toContain("– | Cadeira | 1 | 1 | 100%");
  });
});
