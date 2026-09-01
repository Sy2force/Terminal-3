import { describe, it, expect } from "vitest";
import { canCloseOrder, canConfirmPayment } from "./pickup-closure-rules";
import type { OrderClosureContext } from "./pickup-closure-rules";

function baseOrder(
  overrides: Partial<OrderClosureContext["order"]> = {},
): OrderClosureContext["order"] {
  return {
    id: "00000000-0000-4000-8000-000000000000",
    status: "confirmed",
    payment_status: "unpaid",
    payment_method_actual: null,
    paid_at: null,
    id_checked_at: null,
    id_checked_by: null,
    ...overrides,
  };
}

describe("canCloseOrder — non-alcohol", () => {
  it("blocks close when unpaid", () => {
    const r = canCloseOrder({
      order: baseOrder(),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/paiement/i);
  });

  it("allows close after paid_in_store when no age gate", () => {
    const r = canCloseOrder({
      order: baseOrder({ payment_status: "paid_in_store" }),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(true);
  });

  it("blocks close if already completed", () => {
    const r = canCloseOrder({
      order: baseOrder({ status: "completed", payment_status: "paid_in_store" }),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/déjà/i);
  });

  it("blocks close if cancelled", () => {
    const r = canCloseOrder({
      order: baseOrder({ status: "cancelled", payment_status: "paid_in_store" }),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(false);
  });
});

describe("canCloseOrder — alcohol", () => {
  it("blocks close if paid but no ID check yet", () => {
    const r = canCloseOrder({
      order: baseOrder({ payment_status: "paid_in_store" }),
      hasAgeRestrictedItem: true,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/pièce d'identité/i);
  });

  it("allows close only when both gates are open", () => {
    const r = canCloseOrder({
      order: baseOrder({
        payment_status: "paid_in_store",
        id_checked_at: new Date().toISOString(),
        id_checked_by: "admin-uuid",
      }),
      hasAgeRestrictedItem: true,
    });
    expect(r.ok).toBe(true);
  });

  it("still requires payment even after ID check", () => {
    const r = canCloseOrder({
      order: baseOrder({
        payment_status: "unpaid",
        id_checked_at: new Date().toISOString(),
      }),
      hasAgeRestrictedItem: true,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/paiement/i);
  });
});

describe("canConfirmPayment", () => {
  it("blocks re-confirming an already-paid order", () => {
    const r = canConfirmPayment({
      order: baseOrder({ payment_status: "paid_in_store" }),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(false);
  });

  it("allows confirming when unpaid", () => {
    const r = canConfirmPayment({
      order: baseOrder(),
      hasAgeRestrictedItem: false,
    });
    expect(r.ok).toBe(true);
  });
});
