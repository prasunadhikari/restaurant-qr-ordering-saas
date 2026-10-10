import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";

import { allSessionOrdersServed, buildTableSessionBill } from "../src/utils/tableBill.js";
import { canClearTableSession } from "../src/utils/tableBill.js";
import TableSession from "../src/models/TableSession.js";

const order = (
  orderNumber: string,
  status: string,
  items: Array<{ name: string; quantity: number; unitPrice: number; specialInstructions?: string }>,
) => ({ _id: new mongoose.Types.ObjectId(), orderNumber, status, items });

test("combines duplicate items from all non-cancelled table orders", () => {
  const bill = buildTableSessionBill([
    order("A1", "served", [{ name: "Momo", quantity: 2, unitPrice: 100 }]),
    order("A2", "pending", [{ name: "Momo", quantity: 1, unitPrice: 100 }, { name: "Tea", quantity: 1, unitPrice: 50 }]),
    order("A3", "cancelled", [{ name: "Momo", quantity: 10, unitPrice: 100 }]),
  ]);

  assert.equal(bill?.total, 350);
  assert.equal(bill?.items.length, 2);
  assert.equal(bill?.items[0].quantity, 3);
  assert.deepEqual(bill?.items[0].orderNumbers, ["A1", "A2"]);
  assert.equal(bill?.orderIds.length, 2);
});

test("new orders preserve paid amount but reset a stale payment intent", () => {
  const firstOrder = order("A1", "served", [{ name: "Momo", quantity: 1, unitPrice: 100 }]);
  const previous = buildTableSessionBill([firstOrder]);
  assert.ok(previous);
  previous.paidAmount = 100;
  previous.paymentStatus = "paid";

  const refreshed = buildTableSessionBill([
    firstOrder,
    order("A2", "served", [{ name: "Tea", quantity: 1, unitPrice: 50 }]),
  ], previous);

  assert.equal(refreshed?.total, 150);
  assert.equal(refreshed?.paidAmount, 100);
  assert.equal(refreshed?.paymentStatus, "unpaid");
  assert.equal(refreshed?.paymentAmount, 0);
  assert.equal(refreshed?.paymentMethod, undefined);
});

test("payment state remains when the order set is unchanged", () => {
  const orders = [order("A1", "served", [{ name: "Momo", quantity: 1, unitPrice: 100 }])];
  const previous = buildTableSessionBill(orders);
  assert.ok(previous);
  previous.paymentAmount = 100;
  previous.paymentMethod = "cash";
  previous.paymentStatus = "pending";

  const refreshed = buildTableSessionBill(orders, previous);
  assert.equal(refreshed?.paymentAmount, 100);
  assert.equal(refreshed?.paymentMethod, "cash");
  assert.equal(refreshed?.paymentStatus, "pending");
});

test("only served or cancelled orders permit payment and table clearance", () => {
  assert.equal(allSessionOrdersServed([{ status: "served" }, { status: "cancelled" }]), true);
  assert.equal(allSessionOrdersServed([{ status: "served" }, { status: "preparing" }]), false);
  assert.equal(allSessionOrdersServed([]), true);
});

test("table clearance requires complete payment and resolved cancelled orders", () => {
  const served = [{ status: "served" }];
  assert.equal(canClearTableSession(served), true);
  assert.equal(canClearTableSession(served, { paymentStatus: "unpaid", paidAmount: 0, total: 100 }), false);
  assert.equal(canClearTableSession(served, { paymentStatus: "paid", paidAmount: 50, total: 100 }), false);
  assert.equal(canClearTableSession(served, { paymentStatus: "paid", paidAmount: 100, total: 100 }), true);
  assert.equal(canClearTableSession([{ status: "cancelled", paymentStatus: "pending" }]), false);
  assert.equal(canClearTableSession([{ status: "cancelled", paymentStatus: "unpaid" }]), true);
  assert.equal(canClearTableSession([{ status: "preparing" }]), false);
});

test("new table sessions do not acquire an empty bill by schema default", () => {
  const session = new TableSession({
    restaurantId: new mongoose.Types.ObjectId(),
    tableId: new mongoose.Types.ObjectId(),
    tableNumber: "1",
  });
  assert.equal(session.bill, undefined);
});

test("an empty or fully cancelled session has no bill", () => {
  assert.equal(buildTableSessionBill([]), null);
  assert.equal(buildTableSessionBill([order("A1", "cancelled", [])]), null);
});
