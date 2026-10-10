export const RESTAURANT_TIME_ZONE = "Asia/Kathmandu";
const RESTAURANT_UTC_OFFSET_MINUTES = 5 * 60 + 45;

export const getRestaurantDayRange = (
  date?: string,
  now = new Date(),
): { start: Date; end: Date; date: string } | null => {
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RESTAURANT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const today = `${dateParts.find((part) => part.type === "year")?.value}-${dateParts.find((part) => part.type === "month")?.value}-${dateParts.find((part) => part.type === "day")?.value}`;
  const selected = date ?? today;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(selected);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const localDate = new Date(Date.UTC(year, month - 1, day));
  if (
    localDate.getUTCFullYear() !== year ||
    localDate.getUTCMonth() !== month - 1 ||
    localDate.getUTCDate() !== day
  ) return null;

  const start = new Date(localDate.getTime() - RESTAURANT_UTC_OFFSET_MINUTES * 60_000);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60_000), date: selected };
};

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
