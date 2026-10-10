import assert from "node:assert/strict";
import test from "node:test";

import {
  areValidCoordinates,
  distanceBetweenCoordinates,
  getRestaurantDayRange,
  isRestaurantOpen,
  isWithinCoordinatesRadius,
} from "../src/utils/restaurantStatus.js";

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

test("payment day boundaries follow Nepal local time", () => {
  const range = getRestaurantDayRange("2026-10-10");
  assert.ok(range);
  assert.equal(range.start.toISOString(), "2026-10-09T18:15:00.000Z");
  assert.equal(range.end.toISOString(), "2026-10-10T18:15:00.000Z");
});

test("rejects invalid payment dates", () => {
  assert.equal(getRestaurantDayRange("2026-02-30"), null);
  assert.equal(getRestaurantDayRange("10-10-2026"), null);
});

test("validates coordinates and enforces the 100 meter QR access radius", () => {
  const restaurant = { latitude: 27.7172, longitude: 85.324 };
  const nearby = { latitude: 27.7175, longitude: 85.324 };
  const farAway = { latitude: 27.72, longitude: 85.324 };

  assert.equal(areValidCoordinates(restaurant), true);
  assert.equal(areValidCoordinates({ latitude: 91, longitude: 0 }), false);
  assert.equal(areValidCoordinates({ latitude: 0, longitude: Number.NaN }), false);
  assert.ok(distanceBetweenCoordinates(restaurant, nearby) < 100);
  assert.equal(isWithinCoordinatesRadius(nearby, restaurant), true);
  assert.equal(isWithinCoordinatesRadius(farAway, restaurant), false);
});
