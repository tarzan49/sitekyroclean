import { describe, expect, it } from "vitest";
import { computeGoogleAdsResults, isGoogleService, googlePhoneSet, type ContactRow, type ServiceRow } from "./googleAdsResults";

// Dados inventados: o repositório é público.
const service = (o: Partial<ServiceRow>): ServiceRow => ({
  id: Math.random().toString(36).slice(2), booked_at: "2026-10-06T10:00:00Z", created_at: "2026-10-06T10:00:00Z",
  request_date: "2026-10-10", billed_value: 100, my_cut: 50, upsell_value: 0, upsell_team: null,
  locality: "Porto", phone: null, source: "Google Calendar", client_name: null, description: "Limpeza de sofá", ...o,
});
const contact = (o: Partial<ContactRow>): ContactRow => ({
  phone: "351910000000", from_google_ads: false, first_contact_at: "2026-10-06T09:00:00Z", status: "por_marcar", ...o,
});

describe("googleAdsResults", () => {
  it("a service is Google by the calendar mark or by a Google contact's phone", () => {
    const phones = googlePhoneSet([contact({ phone: "351911111111", from_google_ads: true })]);
    expect(isGoogleService(service({ source: "Google Ads" }), phones)).toBe(true);
    expect(isGoogleService(service({ phone: "+351 911 111 111" }), phones)).toBe(true);
    expect(isGoogleService(service({ phone: "912222222" }), phones)).toBe(false);
  });

  it("splits services and contacts between Google and the rest, by the day they closed", () => {
    const contacts = [
      contact({ phone: "351911111111", from_google_ads: true }),
      contact({ phone: "351913333333", from_google_ads: true }),
      contact({ phone: "351912222222" }),
    ];
    const services = [
      service({ phone: "911111111", billed_value: 139, my_cut: 69.5 }),
      service({ source: "Google Ads", billed_value: 49, my_cut: 24.5 }),
      service({ phone: "912222222", billed_value: 79, my_cut: 39.5 }),
      // Fechado ontem: fora do período de hoje, mesmo com o serviço hoje.
      service({ phone: "911111111", booked_at: "2026-10-05T10:00:00Z", request_date: "2026-10-06" }),
    ];
    const stats = [
      { stat_date: "2026-10-06", campaign_id: "1", campaign_name: "Porto", impressions: 100, clicks: 20, cost: 40, conversions: 1 },
      { stat_date: "2026-10-06", campaign_id: "2", campaign_name: "Lisboa", impressions: 176, clicks: 18, cost: 33.28, conversions: 0 },
    ];
    const r = computeGoogleAdsResults(services, contacts, stats, "2026-10-06", "2026-10-06");
    expect(r.google).toEqual({ contacts: 2, contactsClosed: 1, services: 2, billed: 188, share: 94 });
    expect(r.other).toEqual({ contacts: 1, contactsClosed: 1, services: 1, billed: 79, share: 39.5 });
    expect(r.cost).toBe(73.28);
    expect(r.clicks).toBe(38);
    expect(r.campaigns.map(c => c.name)).toEqual(["Porto", "Lisboa"]);
    expect(r.daysWithoutStats).toBe(0);
  });

  it("uses the Lisbon day: a service closed at 23:30 UTC in summer belongs to the next day", () => {
    const r = computeGoogleAdsResults([service({ source: "Google Ads", booked_at: "2026-10-05T23:30:00Z" })], [], [], "2026-10-06", "2026-10-06");
    expect(r.google.services).toBe(1);
  });

  it("counts the owner's part of an upsell in the share, like the CRM", () => {
    const r = computeGoogleAdsResults([service({ source: "Google Ads", my_cut: 50, upsell_value: 100, upsell_team: "Lisboa 1" })], [], [], "2026-10-06", "2026-10-06");
    expect(r.google.share).toBe(80);
  });
});
