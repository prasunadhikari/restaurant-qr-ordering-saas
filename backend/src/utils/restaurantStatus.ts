export const RESTAURANT_TIME_ZONE = "Asia/Kathmandu";

interface RestaurantOperationalStatus {
  status: string;
  acceptingOrders: boolean;
  openingHours?: { open: string; close: string };
}

export const isRestaurantOpen = (
  restaurant: RestaurantOperationalStatus,
  now = new Date(),
): boolean => {
  if (restaurant.status !== "active" || !restaurant.acceptingOrders) {
    return false;
  }

  const open = restaurant.openingHours?.open;
  const close = restaurant.openingHours?.close;
  if (!open || !close) return true;

  const parseTime = (value: string): number | null => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };

  const openAt = parseTime(open);
  const closeAt = parseTime(close);
  if (openAt === null || closeAt === null) return true;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESTAURANT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const current = hour * 60 + minute;

  return openAt < closeAt
    ? current >= openAt && current < closeAt
    : openAt > closeAt
      ? current >= openAt || current < closeAt
      : false;
};
