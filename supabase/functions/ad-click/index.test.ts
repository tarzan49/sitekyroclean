import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { parseAdClick } from "./index.ts";

Deno.test("aceita código e gclid", () => {
  assertEquals(parseAdClick({ ref: "K7F2Q", gclid: "CjwKCAjw-abc_123", page: "/limpeza-sofas-lisboa" }),
    { ref: "K7F2Q", gclid: "CjwKCAjw-abc_123", gbraid: null, wbraid: null, page: "/limpeza-sofas-lisboa" });
});

Deno.test("recusa código mal formado ou sem clique", () => {
  assertEquals(parseAdClick({ ref: "K7F2O", gclid: "CjwKCAjw-abc_123" }), null); // O é ambíguo
  assertEquals(parseAdClick({ ref: "K7F2Q" }), null);
  assertEquals(parseAdClick({ ref: "K7F2Q", gclid: "x<script>" }), null);
  assertEquals(parseAdClick(null), null);
});
