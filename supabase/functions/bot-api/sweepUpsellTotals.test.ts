import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { titleWithUpsellTotal } from "./index.ts";

Deno.test("título leva serviço + upsell no total (dono, 16 Nov, Flávia)", () => {
  assertEquals(titleWithUpsellTotal("Serviço 122€ (242,31€) Tapete - 925208170", 242.31, 404.67), "Serviço 122€ (646,98€) Tapete - 925208170");
  assertEquals(titleWithUpsellTotal("Serviço 217€ (434€) Imper - 912032825", 434, 149), "Serviço 217€ (583€) Imper - 912032825");
  assertEquals(titleWithUpsellTotal("Serviço 217€ (583€) Imper - 912032825", 434, 149), "Serviço 217€ (583€) Imper - 912032825");
  assertEquals(titleWithUpsellTotal("Serviço 50€ (100€) Sofá", 100, 0), "Serviço 50€ (100€) Sofá");
});
