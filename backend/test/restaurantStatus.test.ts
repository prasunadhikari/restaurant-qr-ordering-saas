import assert from "node:assert/strict";
import test from "node:test";

import { isRestaurantOpen } from "../src/utils/restaurantStatus.js";

const activeRestaurant = {
  status: "active",
  acceptingOrders: true,
  openingHours: { open: "12:00", close: "13:00" },
};

test("uses Nepal local time for the configured opening-hours window", () => {
  assert.equal(
    isRestaurantOpen(activeRestaurant, new Date("2026-10-09T06:15:00.000Z")),
    true,
  );
});

test("opens at the opening time and closes at the closing time", () => {
  assert.equal(
    isRestaurantOpen(activeRestaurant, new Date("2026-10-09T06:15:00.000Z")),
    true,
  );
  assert.equal(
    isRestaurantOpen(activeRestaurant, new Date("2026-10-09T07:15:00.000Z")),
    false,
  );
});

test("does not accept orders outside opening hours or while order taking is paused", () => {
  assert.equal(
    isRestaurantOpen(activeRestaurant, new Date("2026-10-09T05:00:00.000Z")),
    false,
  );
  assert.equal(
    isRestaurantOpen(
      { ...activeRestaurant, acceptingOrders: false },
      new Date("2026-10-09T06:30:00.000Z"),
    ),
    false,
  );
});

test("does not treat inactive or pending accounts as operationally open", () => {
  assert.equal(
    isRestaurantOpen(
      { ...activeRestaurant, status: "inactive" },
      new Date("2026-10-09T06:30:00.000Z"),
    ),
    false,
  );
  assert.equal(
    isRestaurantOpen(
      { ...activeRestaurant, status: "pending" },
      new Date("2026-10-09T06:30:00.000Z"),
    ),
    false,
  );
});

test("supports opening hours that cross midnight", () => {
  const overnightRestaurant = {
    ...activeRestaurant,
    openingHours: { open: "22:00", close: "02:00" },
  };

  assert.equal(
    isRestaurantOpen(overnightRestaurant, new Date("2026-10-09T16:30:00.000Z")),
    true,
  );
  assert.equal(
    isRestaurantOpen(overnightRestaurant, new Date("2026-10-09T21:00:00.000Z")),
    false,
  );
});
