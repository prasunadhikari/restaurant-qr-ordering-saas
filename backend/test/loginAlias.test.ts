import assert from "node:assert/strict";
import test from "node:test";

import { buildLoginAliasBase } from "../src/utils/loginAlias.js";

test("login aliases use role prefixes and normalized name slugs", () => {
  assert.equal(buildLoginAliasBase("restaurant_owner", "José O'Neil"), "owner-jose-o-neil");
  assert.equal(buildLoginAliasBase("restaurant_manager", "Jane Doe"), "manager-jane-doe");
  assert.equal(buildLoginAliasBase("restaurant_staff", "!!!"), "staff-user");
  assert.equal(buildLoginAliasBase("platform_admin", "A Person"), "admin-a-person");
});
