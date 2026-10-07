export const clearOwnerSession = (): void => {
  localStorage.removeItem("ownerToken");
  localStorage.removeItem("ownerUser");
};

export const clearAdminSession = (): void => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

export const clearStaffSession = (): void => {
  localStorage.removeItem("staffToken");
  localStorage.removeItem("staffUser");
  localStorage.removeItem("staffRestaurant");
};
