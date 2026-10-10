import assert from "node:assert/strict";
import test from "node:test";

import { isPlatformAdminEmail, platformAdminEmail } from "../src/utils/adminLogin.js";

test("platform admin login accepts only its configured email, case-insensitively", () => {
  assert.equal(isPlatformAdminEmail(platformAdminEmail), true);
  assert.equal(isPlatformAdminEmail(" ADMIN@RestaurantOS.Local "), true);
  assert.equal(isPlatformAdminEmail("admin@example.com"), false);
  assert.equal(isPlatformAdminEmail("admin-prasun"), false);
});
