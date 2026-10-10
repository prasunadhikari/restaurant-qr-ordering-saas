export const platformAdminEmail = "admin@restaurantos.local";

export const isPlatformAdminEmail = (value: string): boolean =>
  value.trim().toLowerCase() === platformAdminEmail;
