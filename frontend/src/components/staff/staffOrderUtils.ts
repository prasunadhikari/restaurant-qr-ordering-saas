import type { StaffOrderStatus } from "../../services/staffService";

export const statusLabels: Record<StaffOrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
};

export const nextOrderStatus: Partial<
  Record<StaffOrderStatus, StaffOrderStatus>
> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: "served",
};

export const nextStatusLabels: Partial<Record<StaffOrderStatus, string>> = {
  pending: "Accept order",
  accepted: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark served",
};
