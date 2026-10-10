import User, { IUser } from "../models/User.js";

type UserRole = IUser["role"];

const rolePrefix: Record<UserRole, string> = {
  platform_admin: "admin",
  restaurant_owner: "owner",
  restaurant_manager: "manager",
  restaurant_staff: "staff",
};

export const buildLoginAliasBase = (
  role: UserRole,
  name: string,
): string => {
  const namePart = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "user";
  return `${rolePrefix[role]}-${namePart}`;
};

export const generateLoginAlias = async (
  role: UserRole,
  name: string,
): Promise<string> => {
  const base = buildLoginAliasBase(role, name);
  let alias = base;
  let suffix = 2;
  while (await User.exists({ loginAlias: alias })) {
    alias = `${base}-${suffix}`;
    suffix += 1;
  }
  return alias;
};
