const portalSessionKeys = [
  "ownerToken",
  "ownerUser",
  "adminToken",
  "adminUser",
  "staffToken",
  "staffUser",
  "staffRestaurant",
];

export const clearPortalSessions = (): void => {
  for (const key of portalSessionKeys) {
    localStorage.removeItem(key);
  }
};
